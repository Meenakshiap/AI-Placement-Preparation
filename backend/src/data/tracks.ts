import { CodeLanguage, ILanguageTrack, ITrackModule, ITrackQuizQuestion } from '../types/index.js';

const lesson = (
  id: string,
  number: number,
  title: string,
  topic: string,
  concept: string,
  examples: ITrackModule['examples'],
  commonMistakes: string[],
  starterCode: string,
  expectedOutput: string,
  quiz: ITrackQuizQuestion[]
): ITrackModule => ({
  id, number, title, topic, comingSoon: false, concept, examples, commonMistakes,
  playground: { starterCode, input: '', expectedOutput }, quiz
});

const comingSoon = (trackId: string, total: number, topics: string[], start = 4): ITrackModule[] =>
  Array.from({ length: total - start + 1 }, (_, offset) => {
    const number = start + offset;
    const topic = topics[(number - 1) % topics.length];
    return {
      id: `${trackId}-${String(number).padStart(2, '0')}`,
      number,
      title: `${topic} - Module ${number}`,
      topic,
      comingSoon: true,
      concept: 'Coming soon.'
    };
  });

const pythonTopics = ['Scoping & Closures', 'Mutable Default Args', 'Generators & Iterators', 'OOP Magic Methods', 'GIL & Concurrency'];
const javaTopics = ['Polymorphism & Dynamic Dispatch', 'JVM Memory Model & GC', 'Collections Framework', 'Multithreading & Locks'];
const cppTopics = ['Pointers & References', 'Move Semantics & Rvalues', 'Templates & Metaprogramming', 'STL Vector/Map Internals'];
const javascriptTopics = ['Event Loop & Microtasks', 'Closures & Prototypes', 'Promises & Async/Await', 'Memory Leak Profiling'];

const quiz = (questions: ITrackQuizQuestion[]): ITrackQuizQuestion[] => questions;

export const LANGUAGE_TRACKS: ILanguageTrack[] = [
  {
    id: 'python', name: 'Python 3 Placement Track', level: 'Foundational to Advanced', language: 'python', totalModules: 14, topics: pythonTopics,
    modules: [
      lesson('python-01', 1, 'Scoping & Closures', 'LEGB rule and lexical closures',
        'Python resolves a name by searching Local, Enclosing, Global, then Built-in scopes (LEGB). A nested function can keep access to bindings from its enclosing function after that function returns. Use `nonlocal` to rebind an enclosing local; use `global` only when a module-level name must be rebound.',
        [
          { title: 'A closure remembers its enclosing value', code: 'def make_multiplier(factor):\n    def multiply(value):\n        return value * factor\n    return multiply\n\ndouble = make_multiplier(2)\nprint(double(5))  # 10', explanation: 'The returned function keeps the enclosing factor binding alive.' },
          { title: 'Rebind an enclosing local with nonlocal', code: 'def counter():\n    count = 0\n    def next_value():\n        nonlocal count\n        count += 1\n        return count\n    return next_value', explanation: '`nonlocal` marks count as the binding from counter(), not a new local.' }
        ],
        ['Assuming a nested function copies a value instead of retaining a binding.', 'Using `global` when the desired name belongs to an enclosing function.', 'Reading a local name before assigning to it in the same function.'],
        'def solve(input_data):\n    def make_multiplier(factor):\n        def multiply(value):\n            return value * factor\n        return multiply\n    return str(make_multiplier(3)(4))\n', '12',
        quiz([
          { id: 'py1-q1', topic: 'Scoping & Closures', prompt: 'Which order does Python use for an unqualified name lookup?', options: [{ id: 'a', text: 'Local, Enclosing, Global, Built-in' }, { id: 'b', text: 'Global, Local, Built-in, Enclosing' }, { id: 'c', text: 'Built-in, Global, Enclosing, Local' }], correctOptionId: 'a', explanation: 'LEGB means Local, Enclosing, Global, Built-in.' },
          { id: 'py1-q2', topic: 'Scoping & Closures', prompt: 'What lets a nested function reassign a variable from its enclosing function?', options: [{ id: 'a', text: 'global' }, { id: 'b', text: 'nonlocal' }, { id: 'c', text: 'outer' }], correctOptionId: 'b', explanation: '`nonlocal` targets a binding in the nearest enclosing function scope.' },
          { id: 'py1-q3', topic: 'Scoping & Closures', prompt: 'What does a closure retain from its enclosing scope?', options: [{ id: 'a', text: 'Access to the enclosing bindings it references' }, { id: 'b', text: 'A copy of every local variable' }, { id: 'c', text: 'Only global variables' }], correctOptionId: 'a', explanation: 'A closure retains access to the referenced enclosing bindings.' }
        ])),
      lesson('python-02', 2, 'Mutable Default Arguments', 'Default argument evaluation',
        'Python evaluates a function’s default argument once, when the `def` statement executes. A mutable default such as a list is therefore shared across calls. Use `None` as the default and create a fresh list inside the function.',
        [
          { title: 'Use None as a sentinel', code: 'def append_item(item, items=None):\n    if items is None:\n        items = []\n    items.append(item)\n    return items\n\nprint(append_item("a"))  # ["a"]', explanation: 'Each call without an explicit list gets its own new list.' },
          { title: 'The shared-default trap', code: 'def collect(value, values=[]):\n    values.append(value)\n    return values\n\n# Later calls reuse the same list.', explanation: 'The list is created once and kept in the function defaults.' }
        ],
        ['Creating a mutable default for per-call state.', 'Using `if not items` when an intentionally supplied empty list must be preserved.', 'Assuming the default expression is reevaluated at each call.'],
        'def solve(input_data):\n    def append_item(item, items=None):\n        if items is None:\n            items = []\n        items.append(item)\n        return items\n    return str(append_item("a"))\n', "['a']",
        quiz([
          { id: 'py2-q1', topic: 'Mutable Default Args', prompt: 'When is a function default expression evaluated?', options: [{ id: 'a', text: 'Once when the function is defined' }, { id: 'b', text: 'Every time the function is called' }, { id: 'c', text: 'Only when the default is used' }], correctOptionId: 'a', explanation: 'Default expressions are evaluated once as the function definition executes.' },
          { id: 'py2-q2', topic: 'Mutable Default Args', prompt: 'What is the standard safe pattern for a list default?', options: [{ id: 'a', text: 'Use an empty list and copy it in the body' }, { id: 'b', text: 'Use None, then create a list inside the function' }, { id: 'c', text: 'Use a global list' }], correctOptionId: 'b', explanation: 'A None sentinel allows a fresh list to be created for each call.' },
          { id: 'py2-q3', topic: 'Mutable Default Args', prompt: 'Why can a default list retain values from earlier calls?', options: [{ id: 'a', text: 'The same list object is reused' }, { id: 'b', text: 'Python caches all list contents by value' }, { id: 'c', text: 'The list becomes global automatically' }], correctOptionId: 'a', explanation: 'The default points to one list object shared by calls that omit the argument.' }
        ])),
      lesson('python-03', 3, 'Generators & Iterators', 'Lazy iteration with yield',
        'An iterator implements `__iter__` and `__next__`. A generator function uses `yield` to produce values lazily and automatically implements the iterator protocol. Generators can process large streams without materializing every value at once.',
        [
          { title: 'Yield values on demand', code: 'def squares(limit):\n    for number in range(limit):\n        yield number * number\n\nprint(list(squares(4)))  # [0, 1, 4, 9]', explanation: 'Each next() resumes execution after the previous yield.' },
          { title: 'Consume an iterator once', code: 'values = (n for n in range(3))\nprint(next(values))  # 0\nprint(list(values))  # [1, 2]', explanation: 'Generators are stateful iterators and are exhausted after consumption.' }
        ],
        ['Expecting a generator to be reusable after it is exhausted.', 'Returning a list when a lazy stream is required.', 'Using `return value` when the intent is to yield multiple values.'],
        'def solve(input_data):\n    def squares(limit):\n        for number in range(limit):\n            yield number * number\n    return str(list(squares(4)))\n', '[0, 1, 4, 9]',
        quiz([
          { id: 'py3-q1', topic: 'Generators & Iterators', prompt: 'What does `yield` do in a generator function?', options: [{ id: 'a', text: 'Returns a value and pauses the function state' }, { id: 'b', text: 'Terminates the Python process' }, { id: 'c', text: 'Creates a list immediately' }], correctOptionId: 'a', explanation: '`yield` produces one value and suspends the generator for later resumption.' },
          { id: 'py3-q2', topic: 'Generators & Iterators', prompt: 'Which method advances an iterator by one item?', options: [{ id: 'a', text: 'next()' }, { id: 'b', text: 'advance()' }, { id: 'c', text: 'step()' }], correctOptionId: 'a', explanation: '`next(iterator)` requests the next value from an iterator.' },
          { id: 'py3-q3', topic: 'Generators & Iterators', prompt: 'What happens after a generator is fully consumed?', options: [{ id: 'a', text: 'It restarts automatically' }, { id: 'b', text: 'It is exhausted and raises StopIteration' }, { id: 'c', text: 'It converts itself to a list' }], correctOptionId: 'b', explanation: 'A generator is a one-pass iterator and raises StopIteration after its final yield.' }
        ])),
      ...comingSoon('python', 14, pythonTopics)
    ]
  },
  {
    id: 'java', name: 'Java Core & Modern OOP', level: 'Intermediate to Advanced', language: 'java', totalModules: 16, topics: javaTopics,
    modules: [
      lesson('java-01', 1, 'Polymorphism & Dynamic Dispatch', 'Overriding and runtime dispatch',
        'A superclass reference can refer to a subclass object. When an overridable instance method is called, Java chooses the implementation using the object’s runtime class. Fields and static methods are resolved from the declared type instead.',
        [
          { title: 'Runtime dispatch selects the override', code: 'class Shape { String name() { return "shape"; } }\nclass Circle extends Shape {\n  @Override String name() { return "circle"; }\n}\nShape value = new Circle();\nSystem.out.println(value.name()); // circle', explanation: 'The runtime object is Circle, so its overridden method executes.' },
          { title: 'Use @Override to catch signature mistakes', code: 'class Base { void run() {} }\nclass Worker extends Base {\n  @Override void run() {}\n}', explanation: 'The annotation asks the compiler to verify that a superclass method is actually overridden.' }
        ],
        ['Confusing overloading with runtime overriding.', 'Expecting a field access to use dynamic dispatch.', 'Reducing visibility when overriding a method.'],
        'public class Main {\n  static String solve(String input) {\n    class Shape { String name() { return "shape"; } }\n    class Circle extends Shape { String name() { return "circle"; } }\n    Shape value = new Circle();\n    return value.name();\n  }\n  public static void main(String[] args) { System.out.print(solve("")); }\n}\n', 'circle',
        quiz([
          { id: 'java1-q1', topic: 'Polymorphism', prompt: 'Which implementation is chosen for an overridden instance method?', options: [{ id: 'a', text: 'The runtime object class implementation' }, { id: 'b', text: 'The declared reference type implementation' }, { id: 'c', text: 'The first class loaded by the JVM' }], correctOptionId: 'a', explanation: 'Overridden instance methods use dynamic dispatch based on the runtime object.' },
          { id: 'java1-q2', topic: 'Polymorphism', prompt: 'What does @Override help the compiler verify?', options: [{ id: 'a', text: 'That a method overrides an inherited method' }, { id: 'b', text: 'That a field is immutable' }, { id: 'c', text: 'That a constructor is inherited' }], correctOptionId: 'a', explanation: 'The annotation catches misspelled or mismatched override signatures.' },
          { id: 'java1-q3', topic: 'Polymorphism', prompt: 'Are Java fields dynamically dispatched?', options: [{ id: 'a', text: 'Yes, using the runtime class' }, { id: 'b', text: 'No, field access is based on the declared type' }, { id: 'c', text: 'Only when the field is public' }], correctOptionId: 'b', explanation: 'Field hiding is resolved using the reference’s declared type.' }
        ])),
      lesson('java-02', 2, 'JVM Memory Model & GC', 'Heap, stack, and reachability',
        'Each thread has its own stack frames for method calls and local variables. Objects are allocated on the shared heap. Garbage collection reclaims heap objects that are no longer reachable from GC roots; it does not guarantee an exact collection time.',
        [
          { title: 'References point to heap objects', code: 'StringBuilder first = new StringBuilder("A");\nStringBuilder second = first;\nsecond.append("B");\nSystem.out.println(first); // AB', explanation: 'Both local references point to the same heap object.' },
          { title: 'Unreachable objects are eligible for collection', code: 'Object value = new Object();\nvalue = null;\n// The object may now be eligible for GC.', explanation: 'Eligibility means unreachable, not that collection happens immediately.' }
        ],
        ['Claiming every local variable is always stored on the stack.', 'Treating `System.gc()` as a guarantee.', 'Confusing object references with the objects they reference.'],
        'public class Main {\n  static String solve(String input) {\n    StringBuilder first = new StringBuilder("A");\n    StringBuilder second = first;\n    second.append("B");\n    return first.toString();\n  }\n  public static void main(String[] args) { System.out.print(solve("")); }\n}\n', 'AB',
        quiz([
          { id: 'java2-q1', topic: 'JVM Memory', prompt: 'Where are Java objects generally allocated?', options: [{ id: 'a', text: 'The shared heap' }, { id: 'b', text: 'Each thread’s instruction pointer' }, { id: 'c', text: 'The class file on disk' }], correctOptionId: 'a', explanation: 'Objects are generally allocated on the JVM heap.' },
          { id: 'java2-q2', topic: 'Garbage Collection', prompt: 'When is an object eligible for garbage collection?', options: [{ id: 'a', text: 'When it is no longer reachable from GC roots' }, { id: 'b', text: 'As soon as its constructor returns' }, { id: 'c', text: 'Whenever System.gc() is called' }], correctOptionId: 'a', explanation: 'Reachability from GC roots determines whether an object is live.' },
          { id: 'java2-q3', topic: 'JVM Memory', prompt: 'What is typically private to each Java thread?', options: [{ id: 'a', text: 'Its stack and call frames' }, { id: 'b', text: 'The entire heap' }, { id: 'c', text: 'All loaded classes' }], correctOptionId: 'a', explanation: 'Each thread has its own stack; the heap is shared.' }
        ])),
      lesson('java-03', 3, 'Collections Framework', 'Choosing List, Set, and Map',
        'Choose a collection by its behavioral contract. A List preserves positional order and allows duplicates, a Set models unique elements, and a Map associates keys with values. Hash-based collections depend on consistent `equals` and `hashCode` implementations.',
        [
          { title: 'Use a set for uniqueness', code: 'Set<String> tags = new HashSet<>();\ntags.add("dsa");\ntags.add("dsa");\nSystem.out.println(tags.size()); // 1', explanation: 'A Set stores unique elements according to its equality contract.' },
          { title: 'Use a map for key lookup', code: 'Map<String, Integer> scores = new HashMap<>();\nscores.put("Ada", 95);\nSystem.out.println(scores.get("Ada")); // 95', explanation: 'A Map provides key-to-value association.' }
        ],
        ['Expecting HashMap iteration order to be sorted.', 'Overriding equals without a compatible hashCode.', 'Using a List when uniqueness is the core requirement.'],
        'public class Main {\n  static String solve(String input) {\n    java.util.Set<String> tags = new java.util.HashSet<>();\n    tags.add("dsa"); tags.add("dsa");\n    return String.valueOf(tags.size());\n  }\n  public static void main(String[] args) { System.out.print(solve("")); }\n}\n', '1',
        quiz([
          { id: 'java3-q1', topic: 'Collections', prompt: 'Which collection models unique elements?', options: [{ id: 'a', text: 'Set' }, { id: 'b', text: 'List' }, { id: 'c', text: 'Deque' }], correctOptionId: 'a', explanation: 'A Set models membership without duplicate elements.' },
          { id: 'java3-q2', topic: 'Collections', prompt: 'What contract must hash-based keys keep consistent?', options: [{ id: 'a', text: 'equals and hashCode' }, { id: 'b', text: 'compareTo and toString' }, { id: 'c', text: 'clone and finalize' }], correctOptionId: 'a', explanation: 'Equal keys must produce the same hash code.' },
          { id: 'java3-q3', topic: 'Collections', prompt: 'Which interface associates keys with values?', options: [{ id: 'a', text: 'Map' }, { id: 'b', text: 'Set' }, { id: 'c', text: 'List' }], correctOptionId: 'a', explanation: 'Map represents key-to-value associations.' }
        ])),
      ...comingSoon('java', 16, javaTopics)
    ]
  },
  {
    id: 'cpp', name: 'C++ STL & Low-Level Mechanics', level: 'Advanced', language: 'cpp', totalModules: 12, topics: cppTopics,
    modules: [
      lesson('cpp-01', 1, 'Pointers & References', 'Address, dereference, and aliasing',
        'A pointer stores an address and can be null or reseated. A reference is an alias that must bind to an object at initialization. Use references for non-null parameters and pointers when absence or reseating is part of the contract.',
        [
          { title: 'A pointer can be checked before dereference', code: 'int value = 7;\nint* pointer = &value;\nif (pointer != nullptr) {\n  std::cout << *pointer;\n}', explanation: '`&` takes an address and `*` dereferences a valid pointer.' },
          { title: 'A reference aliases an existing object', code: 'int value = 7;\nint& alias = value;\nalias += 1;\nstd::cout << value; // 8', explanation: 'Writing through the reference updates the original object.' }
        ],
        ['Dereferencing a null or dangling pointer.', 'Expecting a reference to be reseatable.', 'Returning a reference to a local variable.'],
        '#include <iostream>\n#include <string>\nusing namespace std;\nstring solve(const string& input) { int value=7; int& alias=value; alias+=1; return to_string(value); }\nint main(){ cout << solve(""); }\n', '8',
        quiz([
          { id: 'cpp1-q1', topic: 'Pointers', prompt: 'What does a pointer store?', options: [{ id: 'a', text: 'An object address' }, { id: 'b', text: 'An object copy' }, { id: 'c', text: 'A type name only' }], correctOptionId: 'a', explanation: 'A pointer represents an address and can be null.' },
          { id: 'cpp1-q2', topic: 'References', prompt: 'Can a C++ reference be reseated after initialization?', options: [{ id: 'a', text: 'No, it remains an alias to its bound object' }, { id: 'b', text: 'Yes, with the assignment operator' }, { id: 'c', text: 'Only when const' }], correctOptionId: 'a', explanation: 'Assignment through a reference changes the referred object; it does not rebind the reference.' },
          { id: 'cpp1-q3', topic: 'Pointers', prompt: 'What should happen before dereferencing a nullable pointer?', options: [{ id: 'a', text: 'Check it is not nullptr' }, { id: 'b', text: 'Cast it to void' }, { id: 'c', text: 'Increment it once' }], correctOptionId: 'a', explanation: 'Dereferencing nullptr is undefined behavior; validate the pointer first.' }
        ])),
      lesson('cpp-02', 2, 'Move Semantics & Rvalues', 'Ownership transfer and value categories',
        'Move semantics allow a type to transfer resources from an expiring object instead of copying them. A move constructor or move assignment operator typically leaves the source valid but in an unspecified state. `std::move` casts; it does not move by itself.',
        [
          { title: 'std::move enables a move operation', code: 'std::string source = "placement";\nstd::string target = std::move(source);\n// target owns the transferred value.', explanation: 'The string move constructor can transfer its internal buffer.' },
          { title: 'A moved-from object remains valid', code: 'std::vector<int> source{1, 2};\nauto target = std::move(source);\nsource.clear(); // valid operation', explanation: 'Do not assume the old contents remain, but the object may be reused.' }
        ],
        ['Assuming std::move performs a move without a move operation.', 'Using a moved-from object as if it kept its old value.', 'Writing a move constructor that fails to leave the source destructible.'],
        '#include <iostream>\n#include <string>\nusing namespace std;\nstring solve(const string& input) { string source="move"; string target=std::move(source); return target; }\nint main(){ cout << solve(""); }\n', 'move',
        quiz([
          { id: 'cpp2-q1', topic: 'Move Semantics', prompt: 'What does std::move do by itself?', options: [{ id: 'a', text: 'Casts an expression to an rvalue reference category' }, { id: 'b', text: 'Copies the object' }, { id: 'c', text: 'Immediately frees the source' }], correctOptionId: 'a', explanation: '`std::move` enables overload resolution for move operations; the operation does the transfer.' },
          { id: 'cpp2-q2', topic: 'Move Semantics', prompt: 'What is generally guaranteed about a moved-from standard object?', options: [{ id: 'a', text: 'It remains valid but its value may be unspecified' }, { id: 'b', text: 'It always becomes empty' }, { id: 'c', text: 'It can never be used again' }], correctOptionId: 'a', explanation: 'A moved-from object can be destroyed or assigned; do not depend on its prior value.' },
          { id: 'cpp2-q3', topic: 'Value Categories', prompt: 'Why are rvalues useful for resource-owning types?', options: [{ id: 'a', text: 'They can allow ownership transfer instead of deep copying' }, { id: 'b', text: 'They disable destructors' }, { id: 'c', text: 'They make all objects immutable' }], correctOptionId: 'a', explanation: 'Move operations can transfer resources from expiring values efficiently.' }
        ])),
      lesson('cpp-03', 3, 'Templates & Metaprogramming', 'Generic functions and compile-time selection',
        'Templates let functions and classes work with types supplied at compile time. The compiler instantiates a specialization when needed. Constrain templates with concepts or clear requirements so errors occur near the call site and interfaces remain understandable.',
        [
          { title: 'A function template works with multiple types', code: 'template <typename T>\nT larger(T left, T right) {\n  return left < right ? right : left;\n}\n// larger(3, 7) returns 7', explanation: 'The compiler deduces T from the arguments and instantiates the function.' },
          { title: 'Use a concept to express requirements', code: 'template <typename T>\n  requires std::totally_ordered<T>\nT maximum(T a, T b) { return a < b ? b : a; }', explanation: 'A constraint communicates the operations required of T.' }
        ],
        ['Expecting templates to be dynamically typed at runtime.', 'Hiding complex errors in unconstrained templates.', 'Putting non-inline template definitions only in a separately compiled source file.'],
        '#include <iostream>\n#include <string>\nusing namespace std;\ntemplate<class T> T larger(T a,T b){return a<b?b:a;}\nstring solve(const string& input){return to_string(larger(3,7));}\nint main(){cout<<solve("");}\n', '7',
        quiz([
          { id: 'cpp3-q1', topic: 'Templates', prompt: 'When are ordinary function templates instantiated?', options: [{ id: 'a', text: 'At compile time for used argument types' }, { id: 'b', text: 'Only when the program exits' }, { id: 'c', text: 'At every function call at runtime' }], correctOptionId: 'a', explanation: 'The compiler instantiates template code for the types used.' },
          { id: 'cpp3-q2', topic: 'Templates', prompt: 'What is a key benefit of a C++ concept?', options: [{ id: 'a', text: 'It states compile-time requirements on template arguments' }, { id: 'b', text: 'It allocates objects on the heap' }, { id: 'c', text: 'It replaces constructors' }], correctOptionId: 'a', explanation: 'Concepts constrain templates and improve diagnostics.' },
          { id: 'cpp3-q3', topic: 'Metaprogramming', prompt: 'Does a template parameter imply dynamic dispatch?', options: [{ id: 'a', text: 'No, templates are generally resolved at compile time' }, { id: 'b', text: 'Yes, all templates use virtual calls' }, { id: 'c', text: 'Only for integral types' }], correctOptionId: 'a', explanation: 'Template instantiation is compile-time polymorphism, distinct from virtual dispatch.' }
        ])),
      ...comingSoon('cpp', 12, cppTopics)
    ]
  },
  {
    id: 'javascript', name: 'JavaScript & Web Architecture', level: 'Intermediate', language: 'javascript', totalModules: 15, topics: javascriptTopics,
    modules: [
      lesson('javascript-01', 1, 'Event Loop & Microtasks', 'Tasks, microtasks, and rendering',
        'JavaScript runs one job at a time on an event loop. A task such as a timer callback runs to completion; promise reactions are queued as microtasks and are drained before the next task. This ordering explains many async output questions.',
        [
          { title: 'Promise reactions run before the next timer task', code: 'console.log("A");\nsetTimeout(() => console.log("timer"), 0);\nPromise.resolve().then(() => console.log("microtask"));\nconsole.log("B");\n// A, B, microtask, timer', explanation: 'Synchronous code completes first, then microtasks, then the next task.' },
          { title: 'Microtasks queued by a microtask are drained in the same checkpoint', code: 'Promise.resolve().then(() => {\n  console.log("first");\n  queueMicrotask(() => console.log("second"));\n});', explanation: 'The microtask queue is processed until empty before the next task.' }
        ],
        ['Assuming setTimeout(..., 0) runs before promise callbacks.', 'Treating asynchronous code as parallel JavaScript execution.', 'Forgetting synchronous code runs to completion before queued work.'],
        'function solve(input) {\n  const order = [];\n  order.push("sync");\n  Promise.resolve().then(() => order.push("microtask"));\n  return order.join(",");\n}\n', 'sync',
        quiz([
          { id: 'js1-q1', topic: 'Event Loop', prompt: 'After the current synchronous job, which queue is drained before the next timer task?', options: [{ id: 'a', text: 'Microtasks, including promise reactions' }, { id: 'b', text: 'All future timers' }, { id: 'c', text: 'The rendering queue only' }], correctOptionId: 'a', explanation: 'The event loop drains the microtask queue after a task completes.' },
          { id: 'js1-q2', topic: 'Microtasks', prompt: 'Does setTimeout(callback, 0) run immediately?', options: [{ id: 'a', text: 'No, it queues a later task' }, { id: 'b', text: 'Yes, before the current call stack' }, { id: 'c', text: 'Only when the callback is async' }], correctOptionId: 'a', explanation: 'A zero delay does not interrupt the current job; the callback is queued as a task.' },
          { id: 'js1-q3', topic: 'Event Loop', prompt: 'Can two JavaScript jobs on the same main thread execute simultaneously?', options: [{ id: 'a', text: 'No, each job runs to completion' }, { id: 'b', text: 'Yes, whenever a Promise is used' }, { id: 'c', text: 'Only inside a timer' }], correctOptionId: 'a', explanation: 'The main-thread event loop runs one job at a time.' }
        ])),
      lesson('javascript-02', 2, 'Closures & Prototypes', 'Lexical environments and delegation',
        'A closure is a function together with access to its lexical environment. JavaScript objects delegate property lookup through their prototype chain. Class syntax builds on this prototype mechanism; it does not create a separate inheritance model.',
        [
          { title: 'A closure captures a lexical binding', code: 'function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\nconsole.log(next(), next()); // 1 2', explanation: 'The returned function retains access to count after makeCounter returns.' },
          { title: 'Prototype lookup delegates to another object', code: 'const base = { greet() { return "hello"; } };\nconst child = Object.create(base);\nconsole.log(child.greet()); // hello', explanation: 'The property is found by following child’s prototype.' }
        ],
        ['Assuming a closure snapshots a primitive at function creation.', 'Confusing an object’s own properties with inherited properties.', 'Mutating a shared prototype when instance-specific state is intended.'],
        'function solve(input) {\n  function makeCounter() { let count = 0; return () => ++count; }\n  const next = makeCounter();\n  return String(next() + next());\n}\n', '3',
        quiz([
          { id: 'js2-q1', topic: 'Closures', prompt: 'What does a closure retain?', options: [{ id: 'a', text: 'Access to its lexical environment' }, { id: 'b', text: 'A copy of the whole global object' }, { id: 'c', text: 'Only the function source text' }], correctOptionId: 'a', explanation: 'A closure retains access to bindings from the lexical scope where it was created.' },
          { id: 'js2-q2', topic: 'Prototypes', prompt: 'How can an object obtain a property it does not own?', options: [{ id: 'a', text: 'Lookup continues along its prototype chain' }, { id: 'b', text: 'The property is copied from every object at startup' }, { id: 'c', text: 'Only through JSON parsing' }], correctOptionId: 'a', explanation: 'Property lookup delegates through the prototype chain.' },
          { id: 'js2-q3', topic: 'Prototypes', prompt: 'What is JavaScript class syntax built on?', options: [{ id: 'a', text: 'Prototype-based delegation' }, { id: 'b', text: 'A separate JVM class model' }, { id: 'c', text: 'Global variables' }], correctOptionId: 'a', explanation: 'Class methods and inheritance are implemented using prototypes.' }
        ])),
      lesson('javascript-03', 3, 'Promises & Async/Await', 'Promise states and error flow',
        'A Promise represents a future fulfillment or rejection. `async` functions always return a Promise, and `await` suspends that function until the Promise settles without blocking the JavaScript thread. Use `try/catch` or `.catch()` to handle rejection.',
        [
          { title: 'Await and handle rejection', code: 'async function loadValue() {\n  try {\n    const value = await Promise.resolve(42);\n    return value;\n  } catch (error) {\n    return null;\n  }\n}', explanation: 'The try/catch handles a rejected Promise awaited in the function.' },
          { title: 'Run independent work together', code: 'const [user, settings] = await Promise.all([\n  getUser(), getSettings()\n]);', explanation: 'Promise.all starts both operations and waits for both results.' }
        ],
        ['Forgetting that an async function returns a Promise.', 'Leaving a rejection unhandled.', 'Awaiting independent requests sequentially when they can run together.'],
        'function solve(input) {\n  return Promise.resolve("ready").then(value => value);\n}\n', 'ready',
        quiz([
          { id: 'js3-q1', topic: 'Promises', prompt: 'What does every async function return?', options: [{ id: 'a', text: 'A Promise' }, { id: 'b', text: 'A generator' }, { id: 'c', text: 'A timer handle' }], correctOptionId: 'a', explanation: 'Async functions wrap returned values in a Promise.' },
          { id: 'js3-q2', topic: 'Async/Await', prompt: 'Does await block the JavaScript main thread?', options: [{ id: 'a', text: 'No, it suspends the async function until settlement' }, { id: 'b', text: 'Yes, it pauses the whole browser' }, { id: 'c', text: 'Only for resolved promises' }], correctOptionId: 'a', explanation: 'Await suspends that function and lets the event loop continue.' },
          { id: 'js3-q3', topic: 'Promises', prompt: 'How should a rejected awaited Promise normally be handled?', options: [{ id: 'a', text: 'With try/catch around await' }, { id: 'b', text: 'By adding a timer' }, { id: 'c', text: 'By converting it to a string' }], correctOptionId: 'a', explanation: 'A try/catch around await handles a Promise rejection.' }
        ])),
      ...comingSoon('javascript', 15, javascriptTopics)
    ]
  }
];

export const getPublicTrack = (track: ILanguageTrack) => ({
  ...track,
  modules: track.modules.map(module => ({
    ...module,
    quiz: module.quiz?.map(({ correctOptionId: _correctOptionId, explanation: _explanation, ...question }) => question)
  }))
});