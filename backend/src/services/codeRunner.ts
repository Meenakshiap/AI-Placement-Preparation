import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { CodeLanguage, IProblemTestCase } from '../types/index.js';

const TEST_TIMEOUT_MS = 5000;
const COMPILE_TIMEOUT_MS = 15000;
const MAX_MEMORY_BYTES = 192 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 16 * 1024;

export interface CodeTestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  runtimeMs: number;
  error?: string;
}

export interface CodeRunResult {
  results: CodeTestResult[];
  compileError?: string;
  runtimeError?: string;
  runtimeMs: number;
}

interface ProcessResult {
  stdout: string;
  stderr: string;
  runtimeMs: number;
  error?: string;
}

const javascriptRunner = [
  "const fs = require('node:fs');",
  "const vm = require('node:vm');",
  'const source = fs.readFileSync(process.argv[2], "utf8");',
  'const input = fs.readFileSync(0, "utf8");',
  'const sandbox = Object.create(null);',
  'sandbox.input = input;',
  'const context = vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });',
  'new vm.Script(source, { filename: "solution.js" }).runInContext(context, { timeout: 4500 });',
  'const result = new vm.Script("solve(input)").runInContext(context, { timeout: 4500 });',
  'Promise.resolve(result).then(answer => process.stdout.write(answer === undefined || answer === null ? "" : String(answer)), error => { console.error(error && error.stack ? error.stack : String(error)); process.exitCode = 1; });'
].join('\n');

const pythonRunner = [
  'import ast',
  'import builtins',
  'import collections',
  'import math',
  'import re',
  'import sys',
  'import heapq',
  'import bisect',
  'import itertools',
  'import functools',
  'source_path = sys.argv[1]',
  'source = open(source_path, encoding="utf-8").read()',
  'tree = ast.parse(source, filename="solution.py")',
  'allowed_modules = {"collections": collections, "math": math, "re": re, "heapq": heapq, "bisect": bisect, "itertools": itertools, "functools": functools}',
  'for node in ast.walk(tree):',
  '    if isinstance(node, (ast.Import, ast.ImportFrom)):',
  '        names = [item.name.split(".")[0] for item in node.names] if isinstance(node, ast.Import) else [node.module.split(".")[0] if node.module else ""]',
  '        if any(name not in allowed_modules for name in names): raise ValueError("Only safe standard-library imports are allowed.")',
  '    if isinstance(node, ast.Name) and node.id.startswith("__"): raise ValueError("Dunder names are not allowed.")',
  '    if isinstance(node, ast.Attribute) and node.attr.startswith("__"): raise ValueError("Dunder attributes are not allowed.")',
  'blocked = {"open", "eval", "exec", "compile", "globals", "locals", "vars", "getattr", "setattr", "delattr", "input", "breakpoint"}',
  'safe_names = "abs all any bin bool bytearray bytes chr dict divmod enumerate filter float format frozenset hex int isinstance iter len list map max min next oct ord pow range repr reversed round set slice sorted str sum tuple zip Exception ArithmeticError AssertionError IndexError KeyError LookupError NotImplementedError RuntimeError StopIteration TypeError ValueError ZeroDivisionError".split()',
  'safe_builtins = {name: getattr(builtins, name) for name in safe_names}',
  'def safe_import(name, globals=None, locals=None, fromlist=(), level=0):',
  '    module = allowed_modules.get(name)',
  '    if module is None: raise ImportError("Import is not available in the code runner.")',
  '    return module',
  'safe_builtins["__import__"] = safe_import',
  'namespace = {"__builtins__": safe_builtins, **allowed_modules}',
  'exec(compile(tree, "solution.py", "exec"), namespace, namespace)',
  'if not callable(namespace.get("solve")): raise ValueError("Define solve(input_data) in your solution.")',
  'answer = namespace["solve"](sys.stdin.read())',
  'sys.stdout.write("" if answer is None else str(answer))'
].join('\n');

const javaNetworkGuard = (workDir: string) => [
  'import java.io.FilePermission;',
  'import java.net.SocketPermission;',
  'import java.security.Permission;',
  'public final class NetworkGuard extends SecurityManager {',
  `  private final String allowedPath = ${JSON.stringify(workDir + path.sep)};`,
  '  @Override public void checkPermission(Permission permission) {',
  '    if (permission instanceof SocketPermission) throw new SecurityException("Network access is disabled.");',
  '    if (permission instanceof FilePermission) {',
  '      FilePermission file = (FilePermission) permission;',
  '      String target = new java.io.File(file.getName()).getAbsolutePath();',
  '      String javaHome = new java.io.File(System.getProperty("java.home")).getAbsolutePath() + java.io.File.separator;',
  '      if ((!target.toLowerCase().startsWith(allowedPath.toLowerCase()) && !target.toLowerCase().startsWith(javaHome.toLowerCase())) || file.getActions().contains("write") || file.getActions().contains("delete")) throw new SecurityException("File access is disabled.");',
  '    }',
  '    if (permission instanceof RuntimePermission) {',
  '      String name = permission.getName();',
  '      if (name.equals("setSecurityManager") || name.equals("createClassLoader") || name.startsWith("loadLibrary") || name.startsWith("getenv")) throw new SecurityException("This runtime operation is disabled.");',
  '    }',
  '  }',
  '  @Override public void checkExec(String command) { throw new SecurityException("Process execution is disabled."); }',
  '}'
].join('\n');

const normalizeOutput = (value: string): string => value.replace(/\r\n/g, '\n').trim();

const stopProcessTree = (child: ChildProcessWithoutNullStreams): void => {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    killer.on('error', () => child.kill('SIGKILL'));
  } else {
    child.kill('SIGKILL');
  }
};

const readWorkingSet = async (pid: number): Promise<number> => {
  if (process.platform !== 'win32') {
    try {
      const status = await fs.readFile(`/proc/${pid}/status`, 'utf8');
      const resident = status.match(/^VmRSS:\s+(\d+)\s+kB/m);
      return resident ? Number(resident[1]) * 1024 : 0;
    } catch {
      return 0;
    }
  }

  return new Promise(resolve => {
    const probe = spawn('powershell.exe', [
      '-NoProfile', '-NonInteractive', '-Command',
      `try { [Console]::Write((Get-Process -Id ${pid} -ErrorAction Stop).WorkingSet64) } catch { [Console]::Write('0') }`
    ], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
    let output = '';
    probe.stdout.on('data', chunk => { output += chunk.toString(); });
    probe.on('error', () => resolve(0));
    probe.on('close', () => resolve(Number(output) || 0));
  });
};

const runProcess = (
  command: string,
  args: string[],
  input: string,
  cwd: string,
  timeoutMs: number
): Promise<ProcessResult> => new Promise(resolve => {
  const startedAt = Date.now();
  const child = spawn(command, args, {
    cwd,
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { PATH: process.env.PATH || '', TEMP: cwd, TMP: cwd }
  });
  let stdout = '';
  let stderr = '';
  let failure: string | undefined;
  let finished = false;
  let checkingMemory = false;

  const finish = (error?: string) => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    clearInterval(memoryCheck);
    resolve({ stdout, stderr, runtimeMs: Date.now() - startedAt, error });
  };

  const timeout = setTimeout(() => {
    failure = 'Execution timed out after 5 seconds.';
    stopProcessTree(child);
  }, timeoutMs);
  const memoryCheck = setInterval(async () => {
    if (!child.pid || checkingMemory || finished) return;
    checkingMemory = true;
    const workingSet = await readWorkingSet(child.pid);
    checkingMemory = false;
    if (workingSet > MAX_MEMORY_BYTES && !finished) {
      failure = 'Execution exceeded the 192 MB memory limit.';
      stopProcessTree(child);
    }
  }, 300);

  child.stdout.on('data', chunk => {
    stdout += chunk.toString();
    if (Buffer.byteLength(stdout) > MAX_OUTPUT_BYTES) {
      failure = 'Program output exceeded the 16 KB limit.';
      stopProcessTree(child);
    }
  });
  child.stderr.on('data', chunk => {
    stderr += chunk.toString();
    if (Buffer.byteLength(stderr) > MAX_OUTPUT_BYTES) {
      stderr = stderr.slice(-MAX_OUTPUT_BYTES);
      stopProcessTree(child);
    }
  });
  child.on('error', error => finish(error.message));
  child.on('close', code => {
    const error = failure || (code === 0 ? undefined : stderr.trim() || `Process exited with code ${code}.`);
    finish(error);
  });
  child.stdin.end(input);
});

const compileJava = async (source: string, workDir: string, allowedDirectory: string): Promise<string | undefined> => {
  await fs.writeFile(path.join(workDir, 'Main.java'), source, 'utf8');
  await fs.writeFile(path.join(workDir, 'NetworkGuard.java'), javaNetworkGuard(allowedDirectory), 'utf8');
  const result = await runProcess('javac', ['-proc:none', 'Main.java', 'NetworkGuard.java'], '', workDir, COMPILE_TIMEOUT_MS);
  if (result.error) return result.error.slice(0, 4000);
  try {
    await fs.access(path.join(workDir, 'Main.class'));
    return undefined;
  } catch {
    return 'The Java source must compile a public class named Main.';
  }
};

export const runCode = async (
  language: CodeLanguage,
  source: string,
  testCases: IProblemTestCase[]
): Promise<CodeRunResult> => {
  const startedAt = Date.now();
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'placeai-code-'));
  const allowedDirectory = await fs.realpath(workDir);

  try {
    if (language === 'cpp') {
      return {
        results: [],
        compileError: 'C++ execution is unavailable because this server has no network-isolated C++ toolchain configured.',
        runtimeMs: Date.now() - startedAt
      };
    }

    if (language === 'javascript') {
      await fs.writeFile(path.join(workDir, 'runner.cjs'), javascriptRunner, 'utf8');
      await fs.writeFile(path.join(workDir, 'solution.js'), source, 'utf8');
    } else if (language === 'python') {
      await fs.writeFile(path.join(workDir, 'runner.py'), pythonRunner, 'utf8');
      await fs.writeFile(path.join(workDir, 'solution.py'), source, 'utf8');
    } else {
      const compileError = await compileJava(source, workDir, allowedDirectory);
      if (compileError) return { results: [], compileError, runtimeMs: Date.now() - startedAt };
    }

    const results: CodeTestResult[] = [];
    for (const testCase of testCases) {
      let processResult: ProcessResult;
      if (language === 'javascript') {
        processResult = await runProcess(process.execPath, ['--max-old-space-size=96', 'runner.cjs', 'solution.js'], testCase.input, workDir, TEST_TIMEOUT_MS);
      } else if (language === 'python') {
        processResult = await runProcess('python', ['-I', '-S', 'runner.py', 'solution.py'], testCase.input, workDir, TEST_TIMEOUT_MS);
      } else {
        processResult = await runProcess('java', ['-Xmx96m', '-XX:MaxMetaspaceSize=64m', `-Duser.dir=${workDir}`, '-Djava.security.manager=NetworkGuard', '-cp', '.', 'Main'], testCase.input, workDir, TEST_TIMEOUT_MS);
      }

      const actualOutput = normalizeOutput(processResult.stdout);
      const expectedOutput = normalizeOutput(testCase.expectedOutput);
      results.push({
        passed: !processResult.error && actualOutput === expectedOutput,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: processResult.stdout.slice(0, MAX_OUTPUT_BYTES),
        runtimeMs: processResult.runtimeMs,
        ...(processResult.error ? { error: processResult.error.slice(0, 2000) } : {})
      });
    }
    return { results, runtimeMs: Date.now() - startedAt };
  } catch (error) {
    return {
      results: [],
      runtimeError: error instanceof Error ? error.message : 'Unable to run this submission.',
      runtimeMs: Date.now() - startedAt
    };
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
};