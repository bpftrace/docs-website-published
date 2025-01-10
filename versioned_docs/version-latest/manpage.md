---
slug: '/'
---

# bpftrace(8)

## Name

bpftrace - a high-level tracing language

## Synopsis

**bpftrace** [_OPTIONS_] _FILENAME_\
**bpftrace** [_OPTIONS_] -e 'program code'

When _FILENAME_ is "_-_", bpftrace will read program code from stdin.

## Description

bpftrace is a high-level tracing language and runtime for Linux based on eBPF.
It supports static and dynamic tracing for both the kernel and user-space.

## Examples

* **Trace processes calling sleep**
```
# bpftrace -e 'kprobe:do_nanosleep { printf("%d sleeping\n", pid); }'
```

* **Trace processes calling sleep while spawning `sleep 5` as a child process**
```
# bpftrace -e 'kprobe:do_nanosleep { printf("%d sleeping\n", pid); }' -c 'sleep 5'
```

* **List all probes with "sleep" in their name**
```
# bpftrace -l '*sleep*'
```

* **List all the probes attached in the program**
```
# bpftrace -l -e 'kprobe:do_nanosleep { printf("%d sleeping\n", pid); }'
```

## Supported architectures

x86_64, arm64, s390x, arm32, loongarch64, mips64, ppc64, riscv64

## Options

### *-B* _MODE_

Set the buffer mode for stdout.

* **Valid values are**\
**none** No buffering. Each I/O is written as soon as possible\
**line** Data is written on the first newline or when the buffer is full. This is the default mode.\
**full** Data is written once the buffer is full.

### *-c* _COMMAND_

Run _COMMAND_ as a child process.
When the child terminates bpftrace will also terminate, as if 'exit()' had been called.
If bpftrace terminates before the child process does the child process will be terminated with a SIGTERM.
If used, 'USDT' probes will only be attached to the child process.
To avoid a race condition when using 'USDTs', the child is stopped after 'execve' using 'ptrace(2)' and continued when all 'USDT' probes are attached.
The child process runs with the same privileges as bpftrace itself (usually root).

Unless otherwise specified, bpftrace does not perform any implicit filtering. Therefore, if you are only interested in
events in _COMMAND_, you may want to filter based on the child PID. The child PID is available to programs as the 'cpid' builtin.
For example, you could add the predicate `/pid == cpid/` to probes with userspace context.

### *-d STAGE*

Enable debug mode.
For more details see the [Debug Output](#debug-output) section.

### *--dry-run*

Terminate execution right after attaching all the probes. Useful for testing
that the script can be parsed, loaded, and attached, without actually running
it.

### *-e* _PROGRAM_

Execute _PROGRAM_ instead of reading the program from a file or stdin.

### *-f* _FORMAT_

Set the output format.

* **Valid values are**\
**json**\
**text**

The JSON output is compatible with NDJSON and JSON Lines, meaning each line of the streamed output is a single blob of valid JSON.

### *-h, --help*

Print the help summary.

### *-I* _DIR_

Add the directory _DIR_ to the search path for C headers.
This option can be used multiple times.
For more details see the [Preprocessor Options](#preprocessor-options) section.

### *--include* _FILENAME_

Add _FILENAME_ as an include for the pre-processor.
This is equal to adding '#include _FILENAME_' at the top of the program.
This option can be used multiple times.
For more details see the [Preprocessor Options](#preprocessor-options) section.

### *--info*

Print detailed information about features supported by the kernel and the bpftrace build.

### *-k*

Errors from bpf-helpers(7) are silently ignored by default which can lead to strange results.

This flag enables the detection of errors (except for errors from 'probe_read_*' BPF helpers).
When errors occur bpftrace will log an error containing the source location and the error code:

```
stdin:48-57: WARNING: Failed to probe_read_user_str: Bad address (-14)
u:lib.so:"fn(char const*)" { printf("arg0:%s\n", str(arg0));}
                                                 ~~~~~~~~~
```

### *-kk*

Same as '-k' but also includes the errors from 'probe_read_*'  BPF helpers.

### *-l* [_SEARCH_|_FILENAME_]

List all probes that match the _SEARCH_ pattern.
If the pattern is omitted all probes will be listed.
This pattern supports wildcards in the same way that probes do.
E.g. '-l kprobe:**file**' to list all 'kprobes' with 'file' in the name.
This can be used with a program, which will list all probes in that program.
For more details see the [Listing Probes](#listing-probes) section.

### *--no-feature* _feature,feature,..._

* **Disable detected features, valid values are**\
**uprobe_multi** to disable uprobe_multi link\
**kprobe_multi** to disable kprobe_multi link

### *--no-warnings*

Suppress all warning messages created by bpftrace.

### *-o* _FILENAME_

Write bpftrace tracing output to _FILENAME_ instead of stdout.
This doesn’t include child process (**-c** option) output.
Errors are still written to stderr.

### *-p* _PID_

Attach to the process with _PID_.
If the process terminates, bpftrace will also terminate.
When using USDT probes, uprobes, and uretprobes they will be attached to only this process.
For listing uprobes/uretprobes set the target to '*' and the process’s address space will be searched for the symbols.

### *-q*

Keep messages quiet.

### *--unsafe*

Some calls, like 'system', are marked as unsafe as they can have dangerous side effects ('system("rm -rf")') and are disabled by default.
This flag allows their use.

### *--usdt-file-activation*

Activate usdt semaphores based on file path.

### *-V, --version*

Print bpftrace version information.

### *-v*

Enable verbose messages.
For more details see the [Verbose Output](#verbose-output) section.

## Terminology

|     |     |
| --- | --- |
| BPF | Berkeley Packet Filter: a kernel technology originally developed for optimizing the processing of packet filters (eg, tcpdump expressions). |
| BPF map | A BPF memory object, which is used by bpftrace to create many higher-level objects. |
| BTF | BPF Type Format: the metadata format which encodes the debug info related to BPF program/map. |
| dynamic tracing | Also known as dynamic instrumentation, this is a technology that can instrument any software event, such as function calls and returns, by live modification of instruction text. Target software usually does not need special capabilities to support dynamic tracing, other than a symbol table that bpftrace can read. Since this instruments all software text, it is not considered a stable API, and the target functions may not be documented outside of their source code. |
| eBPF | Enhanced BPF: a kernel technology that extends BPF so that it can execute more generic programs on any events, such as the bpftrace programs listed below. It makes use of the BPF sandboxed virtual machine environment. Also note that eBPF is often just referred to as BPF. |
| kprobes | A Linux kernel technology for providing dynamic tracing of kernel functions. |
| probe | An instrumentation point in software or hardware, that generates events that can execute bpftrace programs. |
| static tracing | Hard-coded instrumentation points in code. Since these are fixed, they may be provided as part of a stable API, and documented. |
| tracepoints | A Linux kernel technology for providing static tracing. |
| uprobes | A Linux kernel technology for providing dynamic tracing of user-level functions. |
| USDT | User Statically-Defined Tracing: static tracing points for user-level software. Some applications support USDT. |

## Program Files

Programs saved as files are often called scripts and can be executed by specifying their file name.
We use a `.bt` file extension, short for bpftrace, but the extension is not required.

For example, listing the sleepers.bt file using `cat`:

```
# cat sleepers.bt

tracepoint:syscalls:sys_enter_nanosleep {
  printf("%s is sleeping.\n", comm);
}
```

And then calling it:

```
# bpftrace sleepers.bt

Attaching 1 probe...
iscsid is sleeping.
iscsid is sleeping.
```

It can also be made executable to run stand-alone.
Start by adding an interpreter line at the top (`#!`) with either the path to your installed bpftrace (/usr/local/bin is the default) or the path to `env` (usually just `/usr/bin/env`) followed by `bpftrace` (so it will find bpftrace in your `$PATH`):

```
#!/usr/local/bin/bpftrace

tracepoint:syscalls:sys_enter_nanosleep {
  printf("%s is sleeping.\n", comm);
}
```

Then make it executable:

```
# chmod 755 sleepers.bt
# ./sleepers.bt

Attaching 1 probe...
iscsid is sleeping.
iscsid is sleeping.
```

## bpftrace Language

The `bpftrace` (`bt`) language is inspired by the D language used by `dtrace` and uses the same program structure.
Each script consists of a preamble and one or more action blocks.

```
preamble

actionblock1
actionblock2
```

Preprocessor and type definitions take place in the preamble:

```
#include <linux/socket.h>
#define RED "\033[31m"

struct S {
  int x;
}
```

Each action block consists of three parts:

```
probe[,probe]
/predicate/ {
  action
}
```

* **Probes**\
  A probe specifies the event and event type to attach too. [Probes list](#probes).
* **Predicate**\
  The predicate is an optional condition that must be met for the action to be executed.
* **Action**\
  Actions are the programs that run when an event fires (and the predicate is met).
An action is a semicolon (`;`) separated list of statements and always enclosed by brackets `{}`.

A program will continue running until Ctrl-C is hit, or an `exit` function is called.
When a program exits, all populated maps are printed (this behavior and maps are explained in later sections).

A basic script that traces the `open(2)` and `openat(2)` system calls can be written as follows:

```
BEGIN {
	printf("Tracing open syscalls... Hit Ctrl-C to end.\n");
}

tracepoint:syscalls:sys_enter_open,
tracepoint:syscalls:sys_enter_openat {
	printf("%-6d %-16s %s\n", pid, comm, str(args.filename));
}
```

The above script has two action blocks and a total of 3 probes.

The first action block uses the special `BEGIN` probe, which fires once during `bpftrace` startup.
This probe is used to print a header, indicating that the tracing has started.

The second action block uses two probes, one for `open` and one for `openat`, and defines an action that prints the file being `open` ed as well as the `pid` and `comm` of the process that execute the syscall.
See the [Probes](#probes) section for details on the available probe types.

### Arrays

bpftrace supports accessing one-dimensional arrays like those found in `C`.

Constructing arrays from scratch, like `int a[] = {1,2,3}` in `C`, is not supported.
They can only be read into a variable from a pointer.

The `[]` operator is used to access elements.

```
struct MyStruct {
  int y[4];
}

kprobe:dummy {
  $s = (struct MyStruct *) arg0;
  print($s->y[0]);
}
```

### Comments

Both single line and multi line comments are supported.

```
// A single line comment
interval:s:1 { // can also be used to comment inline
/*
 a multi line comment

*/
  print(/* inline comment block */ 1);
}
```

### Conditionals

Conditional expressions are supported in the form of if/else statements and the ternary operator.

The ternary operator consists of three operands: a condition followed by a `?`, the expression to execute when the condition is true followed by a `:` and the expression to execute if the condition is false.

```
condition ? ifTrue : ifFalse
```

Both the `ifTrue` and `ifFalse` expressions must be of the same type, mixing types is not allowed.

The ternary operator can be used as part of an assignment.

```
$a == 1 ? print("true") : print("false");
$b = $a > 0 ? $a : -1;
```

If/else statements, like the one in `C`, are supported.

```
if (condition) {
  ifblock
} else if (condition) {
  if2block
} else {
  elseblock
}
```

### Config Block

To improve script portability, you can set bpftrace [Config Variables](#config-variables) via the config block,
which can only be placed at the top of the script before any probes (even `BEGIN`).

```
config = {
    stack_mode=perf;
    max_map_keys=2
}

BEGIN { ... }

uprobe:./testprogs/uprobe_test:uprobeFunction1 { ... }
```

The names of the config variables can be in the format of environment variables
or their lowercase equivalent without the `BPFTRACE_` prefix. For example,
`BPFTRACE_STACK_MODE`, `STACK_MODE`, and `stack_mode` are equivalent.

***Note***: Environment variables for the same config take precedence over those set
inside a script config block.

[List of All Config Variables](#config-variables)

### Data Types

The following fundamental types are provided by the language.
Note: Integers are by default represented as 64 bit signed but that can be
changed by either casting them or, for scratch variables, explicitly specifying
the type upon declaration.

|     |     |
| --- | --- |
| **Type** | **Description** |
| uint8 | Unsigned 8 bit integer |
| int8 | Signed 8 bit integer |
| uint16 | Unsigned 16 bit integer |
| int16 | Signed 16 bit integer |
| uint32 | Unsigned 32 bit integer |
| int32 | Signed 32 bit integer |
| uint64 | Unsigned 64 bit integer |
| int64 | Signed 64 bit integer |

```
BEGIN { $x = 1<<16; printf("%d %d\n", (uint16)$x, $x); }

/*
 * Output:
 * 0 65536
 */
```

### Filtering

Filters (also known as predicates) can be added after probe names.
The probe still fires, but it will skip the action unless the filter is true.

```
kprobe:vfs_read /arg2 < 16/ {
  printf("small read: %d byte buffer\n", arg2);
}

kprobe:vfs_read /comm == "bash"/ {
  printf("read by %s\n", comm);
}
```

### Floating-point

Floating-point numbers are not supported by BPF and therefore not by bpftrace.

### Identifiers

Identifiers must match the following regular expression: `[_a-zA-Z][_a-zA-Z0-9]*`

### Literals

Integer and string literals are supported.

Integer literals can be defined in the following formats:

* decimal (base 10)
* octal (base 8)
* hexadecimal (base 16)
* scientific (base 10)

Octal literals have to be prefixed with a `0` e.g. `0123`.
Hexadecimal literals start with either `0x` or `0X` e.g. `0x10`.
Scientific literals are written in the `<m>e<n>` format which is a shorthand for `m*10^n` e.g. `$i = 2e3;`.
Note that scientific literals are integer only due to the lack of floating point support e.g. `1e-3` is not valid.

To improve the readability of big literals an underscore `_` can be used as field separator e.g. 1_000_123_000.

Integer suffixes as found in the C language are parsed by bpftrace to ensure compatibility with C headers/definitions but they’re not used as size specifiers.
`123UL`, `123U` and `123LL` all result in the same integer type with a value of `123`.

Character literals are not supported at this time, and the corresponding ASCII code must be used instead:

```
BEGIN {
  printf("Echo A: %c\n", 65);
}
```

String literals can be defined by enclosing the character string in double quotes e.g. `$str = "Hello world";`.

Strings support the following escape sequences:

|     |     |
| --- | --- |
| \n | Newline |
| \t | Tab |
| \0nn | Octal value nn |
| \xnn | Hexadecimal value nn |

### Loops

#### For

With Linux 5.13 and later, `for` loops can be used to iterate over elements in a map.

```
for ($kv : @map) {
  block;
}
```

The variable declared in the `for` loop will be initialised on each iteration with a tuple containing a key and a value from the map, i.e. `$kv = (key, value)`.

```
@map[10] = 20;
for ($kv : @map) {
  print($kv.0); // key
  print($kv.1); // value
}
```

When a map has multiple keys, the loop variable will be initialised with nested tuple of the form: `((key1, key2, ...), value)`

```
@map[10,11] = 20;
for ($kv : @map) {
  print($kv.0.0); // key 1
  print($kv.0.1); // key 2
  print($kv.1);   // value
}
```

#### While

Since kernel 5.3 BPF supports loops as long as the verifier can prove they’re bounded and fit within the instruction limit.

In bpftrace, loops are available through the `while` statement.

```
while (condition) {
  block;
}
```

Within a while-loop the following control flow statements can be used:

|     |     |
| --- | --- |
| continue | skip processing of the rest of the block and jump back to the evaluation of the conditional |
| break | Terminate the loop |

```
interval:s:1 {
  $i = 0;
  while ($i <= 100) {
    printf("%d ", $i);
    if ($i > 5) {
      break;
    }
    $i++
  }
  printf("\n");
}
```

#### Unroll

Loop unrolling is also supported with the `unroll` statement.

```
unroll(n) {
  block;
}
```

The compiler will evaluate the block `n` times and generate the BPF code for the block `n` times.
As this happens at compile time `n` must be a constant greater than 0 (`n > 0`).

The following two probes compile into the same code:

```
interval:s:1 {
  unroll(3) {
    print("Unrolled")
  }
}

interval:s:1 {
  print("Unrolled")
  print("Unrolled")
  print("Unrolled")
}
```

### Operators and Expressions

#### Arithmetic Operators

The following operators are available for integer arithmetic:

|     |     |
| --- | --- |
| + | integer addition |
| - | integer subtraction |
| * | integer multiplication |
| / | integer division |
| % | integer modulo |

Operations between a signed and an unsigned integer are allowed providing
bpftrace can statically prove a safe conversion is possible. If safe conversion
is not guaranteed, the operation is undefined behavior and a corresponding
warning will be emitted.

If the two operands are different size, the smaller integer is implicitly
promoted to the size of the larger one. Sign is preserved in the promotion.
For example, `(uint32)5 + (uint8)3` is converted to `(uint32)5 + (uint32)3`
which results in `(uint32)8`.

Pointers may be used with arithmetic operators but only for addition and
subtraction. For subtraction, the pointer must appear on the left side of the
operator. Pointers may also be used with logical operators; they are considered
true when non-null.

#### Logical Operators

|     |     |
| --- | --- |
| && | Logical AND |
| \ | \ |
|  | Logical OR |
| ! | Logical NOT |

#### Bitwise Operators

|     |     |
| --- | --- |
| & | AND |
| \ |  |
| OR | ^ |
| XOR | &lt;&lt; |
| Left shift the left-hand operand by the number of bits specified by the right-hand expression value | >> |

#### Relational Operators

The following relational operators are defined for integers and pointers.

|     |     |
| --- | --- |
| &lt; | left-hand expression is less than right-hand |
| \&lt;= | left-hand expression is less than or equal to right-hand |
| > | left-hand expression is bigger than right-hand |
| >= | left-hand expression is bigger or equal to than right-hand |
| == | left-hand expression equal to right-hand |
| != | left-hand expression not equal to right-hand |

The following relation operators are available for comparing strings and integer arrays.

|     |     |
| --- | --- |
| == | left-hand string equal to right-hand |
| != | left-hand string not equal to right-hand |

#### Assignment Operators

The following assignment operators can be used on both `map` and `scratch` variables:

|     |     |
| --- | --- |
| = | Assignment, assign the right-hand expression to the left-hand variable |
| &lt;\&lt;= | Update the variable with its value left shifted by the number of bits specified by the right-hand expression value |
| >>= | Update the variable with its value right shifted by the number of bits specified by the right-hand expression value |
| += | Increment the variable by the right-hand expression value |
| -= | Decrement the variable by the right-hand expression value |
| *= | Multiple the variable by the right-hand expression value |
| /= | Divide the variable by the right-hand expression value |
| %= | Modulo the variable by the right-hand expression value |
| &= | Bitwise AND the variable by the right-hand expression value |
| \ | = |
| Bitwise OR the variable by the right-hand expression value | ^= |

All these operators are syntactic sugar for combining assignment with the specified operator.
`@ -= 5` is equal to `@ = @ - 5`.

#### Increment and Decrement Operators

The increment (`++`) and decrement (`--`) operators can be used on integer and pointer variables to increment their value by one.
They can only be used on variables and can either be applied as prefix or suffix.
The difference is that the expression `x++` returns the original value of `x`, before it got incremented while `++x` returns the value of `x` post increment.

```
$x = 10;
$y = $x--; // y = 10; x = 9
$a = 10;
$b = --$a; // a = 9; b = 9
```

Note that maps will be implicitly declared and initialized to 0 if not already declared or defined.
Scratch variables must be initialized before using these operators.

Note `++`/`--` on a shared global variable can lose updates. See [`count()`](#count) for more details.

### Pointers

Pointers in bpftrace are similar to those found in `C`.

### Structs

`C` like structs are supported by bpftrace.
Fields are accessed with the `.` operator.
Fields of a pointer to a struct can be accessed with the `\->` operator.

Custom structs can be defined in the preamble.

Constructing structs from scratch, like `struct X var = {.f1 = 1}` in `C`, is not supported.
They can only be read into a variable from a pointer.

```
struct MyStruct {
  int a;
}

kprobe:dummy {
  $ptr = (struct MyStruct *) arg0;
  $st = *$ptr;
  print($st.a);
  print($ptr->a);
}
```

### Tuples

bpftrace has support for immutable N-tuples (`n > 1`).
A tuple is a sequence type (like an array) where, unlike an array, every element can have a different type.

Tuples are a comma separated list of expressions, enclosed in brackets, `(1,2)`
Individual fields can be accessed with the `.` operator.
Tuples are zero indexed like arrays are.

```
interval:s:1 {
  $a = (1,2);
  $b = (3,4, $a);
  print($a);
  print($b);
  print($b.0);
}

/*
 * Sample output:
 * (1, 2)
 * (3, 4, (1, 2))
 * 3
 */
```

### Type conversion

Integer and pointer types can be converted using explicit type conversion with an expression like:

```
$y = (uint32) $z;
$py = (int16 *) $pz;
```

Integer casts to a higher rank are sign extended.
Conversion to a lower rank is done by zeroing leading bits.

It is also possible to cast between integers and integer arrays using the same syntax:

```
$a = (uint8[8]) 12345;
$x = (uint64) $a;
```

Both the cast and the destination type must have the same size.
When casting to an array, it is possible to omit the size which will be determined automatically from the size of the cast value.

Integers are internally represented as 64 bit signed. If you need another representation, you may cast to the supported [Data Types](#data-types).

#### Array casts

It is possible to cast between integer arrays and integers.
Both the source and the destination type must have the same size.
The main purpose of this is to allow casts from/to byte arrays.

```
BEGIN {
  $a = (int8[8])12345;
  printf("%x %x\n", $a[0], $a[1]);
  printf("%d\n", (uint64)$a);
}

/*
 * Output:
 * 39 30
 * 12345
 */
```

When casting to an array, it is possible to omit the size which will be determined automatically from the size of the cast value.

This feature is especially useful when working with IP addresses since various libraries, builtins, and parts of the kernel use different approaches to represent addresses (usually byte arrays vs. integers).
Array casting allows seamless comparison of such representations:

```
fentry:tcp_connect {
    if (args->sk->__sk_common.skc_daddr == (uint32)pton("127.0.0.1"))
        ...
}
```

### Variables and Maps

bpftrace knows two types of variables, 'scratch' and 'map'.

'scratch' variables are kept on the BPF stack and their names always start
with a `$`, e.g. `$myvar`.
'scratch' variables cannot be accessed outside of their lexical block e.g.
```
$a = 1;
if ($a == 1) {
  $b = "hello"
  $a = 2;
}
```

'scratch' variables can also declared before or during initialization with `let` e.g.
```
let $a = 1;
let $b;
if ($a == 1) {
  $b = "hello"
  $a = 2;
}
```

If no assignment is specified variables will initialize to 0.

You can also specify the type in the declaration e.g.
```
let $x: uint8;
let $y: uint8 = 7;
let $a: string = "hiya";
```

'map' variables use BPF 'maps'.
These exist for the lifetime of `bpftrace` itself and can be accessed from all action blocks and user-space.
Map names always start with a `@`, e.g. `@mymap`.

All valid identifiers can be used as `name`.

The data type of a variable is automatically determined during first assignment and cannot be changed afterwards.

#### Maps without Explicit Keys

Values can be assigned directly to maps without a key (sometimes refered to as scalar maps).
Note: you can’t iterate over these maps as they don’t have an accessible key.

```
@name = expression
```

#### Map Keys

Setting single value map keys.

```
@name[key] = expression
```

Map keys that are composed of multiple values are represented as tuples e.g.

```
@name[(key1,key2)] = expression
```

However, this, more concise, syntax is supported and the same as the explicit
tuple above:

```
@name[key1,key2] = expression
```

Just like with any variable the type is determined on first use and cannot be modified afterwards.
This applies to both the key(s) and the value type.

The following snippets create a map with key signature `(int64, string[16])` and a value type of `int64`:

```
@[pid, comm]++
@[(pid, comm)]++
```

#### Per-Thread Variables

These can be implemented as a map keyed on the thread ID. For example, `@start[tid]`:

```
kprobe:do_nanosleep {
  @start[tid] = nsecs;
}

kretprobe:do_nanosleep /has_key(@start, tid)/ {
  printf("slept for %d ms\n", (nsecs - @start[tid]) / 1000000);
  delete(@start, tid);
}

/*
 * Sample output:
 * slept for 1000 ms
 * slept for 1009 ms
 * slept for 2002 ms
 * ...
 */
```

This style of map may also be useful for capturing output parameters, or other context, between two different probes. For example:

```
tracepoint:syscalls:sys_enter_wait4
{
  @out[tid] = args.ru;
}

tracepoint:syscalls:sys_exit_wait4
{
  $ru = @out[tid];
  delete(@out, tid);
  if ($ru != 0) {
    printf("got usage ...", ...);
  }
}
```

## Builtins

Builtins are special variables built into the language.
Unlike scratch and map variables they don’t need a `$` or `@` as prefix (except for the positional parameters).
The 'Kernel' column indicates the minimum kernel version required and the 'BPF Helper' column indicates the raw BPF helper function used for this builtin.

| Variable | Type | Kernel | BPF Helper | Description |
| --- | --- | --- | --- | --- |
| [`$1`, `$2`, `...$n`](#positional-parameters) |
| int64 | n/a | n/a | The nth positional parameter passed to the bpftrace program. If less than n parameters are passed this evaluates to `0`. For string arguments use the `str()` call to retrieve the value. | `$#` |
| int64 | n/a | n/a | Total amount of positional parameters passed. | `arg0`, `arg1`, `...argn` |
| int64 | n/a | n/a | nth argument passed to the function being traced. These are extracted from the CPU registers. The amount of args passed in registers depends on the CPU architecture. (kprobes, uprobes, usdt). | `args` |
| struct args | n/a | n/a | The struct of all arguments of the traced function. Available in `tracepoint`, `fentry`, `fexit`, and `uprobe` (with DWARF) probes. Use `args.x` to access argument `x` or `args` to get a record with all arguments. | cgroup |
| uint64 | 4.18 | get_current_cgroup_id | ID of the cgroup the current process belongs to. Only works with cgroupv2. | comm |
| string[16] | 4.2 | get_current_comm | Name of the current thread | cpid |
| uint32 | n/a | n/a | Child process ID, if bpftrace is invoked with `-c` | cpu |
| uint32 | 4.1 | raw_smp_processor_id | ID of the processor executing the BPF program | curtask |
| uint64 | 4.8 | get_current_task | Pointer to `struct task_struct` of the current task | elapsed |
| uint64 | (see nsec) | ktime_get_ns / ktime_get_boot_ns | Nanoseconds elapsed since bpftrace initialization, based on `nsecs` | func |
| string | n/a | n/a | Name of the current function being traced (kprobes,uprobes) | gid |
| uint64 | 4.2 | get_current_uid_gid | Group ID of the current thread, as seen from the init namespace | jiffies |
| uint64 | 5.9 | get_jiffies_64 | Jiffies of the kernel. In 32-bit system, using this builtin might be slower. | numaid |
| uint32 | 5.8 | numa_node_id | ID of the NUMA node executing the BPF program | pid |
| uint32 | 4.2 | get_current_pid_tgid | Process ID of the current thread (aka thread group ID), as seen from the init namespace | probe |
| string | n/na | n/a | Name of the current probe | rand |
| uint32 | 4.1 | get_prandom_u32 | Random number | return |
| n/a | n/a | n/a | The return keyword is used to exit the current probe. This differs from exit() in that it doesn’t exit bpftrace. | retval |
| uint64 | n/a | n/a | Value returned by the function being traced (kretprobe, uretprobe, fexit). For kretprobe and uretprobe, its type is `uint64`, but for fexit it depends. You can look up the type using `bpftrace -lv` | tid |
| uint32 | 4.2 | get_current_pid_tgid | Thread ID of the current thread, as seen from the init namespace | uid |

### Positional Parameters

**variants**

* `$1`, `$2`, ..., `$N`, `$#`

These are the positional parameters to the bpftrace program, also referred to as command line arguments.
If the parameter is numeric (entirely digits), it can be used as a number.
If it is non-numeric, it must be used as a string in the `str()` call.
If a parameter is used that was not provided, it will default to zero for numeric context, and "" for string context.
Positional parameters may also be used in probe argument and will be treated as a string parameter.

If a positional parameter is used in `str()`, it is interpreted as a pointer to the actual given string literal, which allows to do pointer arithmetic on it.
Only addition of a single constant, less or equal to the length of the supplied string, is allowed.

`$#` returns the number of positional arguments supplied.

This allows scripts to be written that use basic arguments to change their behavior.
If you develop a script that requires more complex argument processing, it may be better suited for bcc instead, which
supports Python’s argparse and completely custom argument processing.

```
# bpftrace -e 'BEGIN { printf("I got %d, %s (%d args)\n", $1, str($2), $#); }' 42 "hello"

I got 42, hello (2 args)

# bpftrace -e 'BEGIN { printf("%s\n", str($1 + 1)) }' "hello"

ello
```

Script example, bsize.d:

```
#!/usr/local/bin/bpftrace

BEGIN
{
	printf("Tracing block I/O sizes > %d bytes\n", $1);
}

tracepoint:block:block_rq_issue
/args.bytes > $1/
{
	@ = hist(args.bytes);
}
```

When run with a 65536 argument:

```
# ./bsize.bt 65536

Tracing block I/O sizes > 65536 bytes
^C

@:
[512K, 1M)             1 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@|

```

It has passed the argument in as `$1` and used it as a filter.

With no arguments, `$1` defaults to zero:

```
# ./bsize.bt
Attaching 2 probes...
Tracing block I/O sizes > 0 bytes
^C

@:
[4K, 8K)             115 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@|
[8K, 16K)             35 |@@@@@@@@@@@@@@@                                     |
[16K, 32K)             5 |@@                                                  |
[32K, 64K)             3 |@                                                   |
[64K, 128K)            1 |                                                    |
[128K, 256K)           0 |                                                    |
[256K, 512K)           0 |                                                    |
[512K, 1M)             1 |                                                    |
```

## Functions

| Function Name | Description | Sync/Async/Compile Time |
| --- | --- | --- |
| `bswap(uint[8 \| 16 \| 32 \| 64] n)` | Reverse byte order | Sync | [`buf(void *d [, int length](#buf))`] |
| Returns a hex-formatted string of the data pointed to by d | Sync | [`cat(char *filename)`](#cat) |
| Print file content | Async | [`cgroupid(char *path)`](#cgroupid) |
| Resolve cgroup ID | Compile Time | [`cgroup_path(int cgroupid, string filter)`](#cgroup_path) |
| Convert cgroup id to cgroup path | Sync | [`exit([int code](#exit))`] |
| Quit bpftrace with an optional exit code | Async | [`join(char *arr[join](#join) [, char *delim])`] |
| Print the array | Async | [`kaddr(char *name)`](#kaddr) |
| Resolve kernel symbol name | Compile Time | [`kptr(void *p)`](#kptr) |
| Annotate as kernelspace pointer | Sync | [`kstack([StackMode mode, ](#kstack)[int level])`] |
| Kernel stack trace | Sync | [`ksym(void *p)`](#ksym) |
| Resolve kernel address | Async | [`macaddr(char[6](#macaddr) addr)`] |
| Convert MAC address data | Sync | [`nsecs([TimestampMode mode](#nsecs))`] |
| Timestamps and Time Deltas | Sync | &lt;&lt;functions-ntop, `ntop([int af, ]int\ |
| char[4\ | 16] addr)`>> | Convert IP address data to text |
| Sync | [`offsetof(struct, element)`](#offsetof) | Offset of element in structure |
| Compile Time | [`override(u64 rc)`](#override) | Override return value |
| Sync | [`path(struct path *path [, int32 size](#path))`] | Return full path |
| Sync | [`percpu_kaddr(const string name [, int cpu](#percpu_kaddr))`] | Resolve percpu kernel symbol name |
| Sync | [`print(...)`](#print) | Print a non-map value with default formatting |
| Async | [`printf(char *fmt, ...)`](#printf) | Print formatted |
| Async | [`pton(const string *addr)`](#pton) | Convert text IP address to byte array |
| Compile Time | [`reg(char *name)`](#reg) | Returns the value stored in the named register |
| Sync | [`signal(char[signal](#signal) signal \ | u32 signal)`] |
| Send a signal to the current process | Sync | [`sizeof(...)`](#sizeof) |
| Return size of a type or expression | Sync | [`skboutput(const string p, struct sk_buff *s, ...)`](#skboutput) |
| Write skb 's data section into a PCAP file | Async | [`str(char *s [, int length](#str))`] |
| Returns the string pointed to by s | Sync | [`strcontains(const char *haystack, const char *needle)`](#strcontains) |
| Compares whether the string haystack contains the string needle. | Sync | [`strerror(uint64 error)`](#strerror) |
| Get error message for errno code | Sync | [`strftime(char *format, int nsecs)`](#strftime) |
| Return a formatted timestamp | Async | [`strncmp(char *s1, char *s2, int length)`](#strncmp) |
| Compare first n characters of two strings | Sync | [`system(char *fmt)`](#system) |
| Execute shell command | Async | [`time(char *fmt)`](#time) |
| Print formatted time | Async | [`uaddr(char *name)`](#uaddr) |
| Resolve user-level symbol name | Compile Time | [`uptr(void *p)`](#uptr) |
| Annotate as userspace pointer | Sync | [`ustack([StackMode mode, ](#ustack)[int level])`] |
| User stack trace | Sync | [`usym(void *p)`](#usym) |

Functions that are marked **async** are asynchronous which can lead to unexpected behaviour, see the [Invocation Mode](#invocation-mode) section for more information.

**compile time** functions are evaluated at compile time, a static value will be compiled into the program.

**unsafe** functions can have dangerous side effects and should be used with care, the `--unsafe` flag is required for use.

### bswap

**variants**

* `uint8 bswap(uint8 n)`
* `uint16 bswap(uint16 n)`
* `uint32 bswap(uint32 n)`
* `uint64 bswap(uint64 n)`

`bswap` reverses the order of the bytes in integer `n`. In case of 8 bit integers, `n` is returned without being modified.
The return type is an unsigned integer of the same width as `n`.

### buf

**variants**

* `buffer buf(void * data, [int64 length])`

`buf` reads `length` amount of bytes from address `data`.
The maximum value of `length` is limited to the `BPFTRACE_MAX_STRLEN` variable.
For arrays the `length` is optional, it is automatically inferred from the signature.

`buf` is address space aware and will call the correct helper based on the address space associated with `data`.

The `buffer` object returned by `buf` can safely be printed as a hex encoded string with the `%r` format specifier.

Bytes with values >=32 and \&lt;=126 are printed using their ASCII character, other bytes are printed in hex form (e.g. `\x00`). The `%rx` format specifier can be used to print everything in hex form, including ASCII characters. The similar `%rh` format specifier prints everything in hex form without `\x` and with spaces between bytes (e.g. `0a fe`).

```
interval:s:1 {
  printf("%r\n", buf(kaddr("avenrun"), 8));
}
```

```
\x00\x03\x00\x00\x00\x00\x00\x00
\xc2\x02\x00\x00\x00\x00\x00\x00
```

### cat

**variants**

* `void cat(string namefmt, [...args])`

**async**

Dump the contents of the named file to stdout.
`cat` supports the same format string and arguments that `printf` does.
If the file cannot be opened or read an error is printed to stderr.

```
tracepoint:syscalls:sys_enter_execve {
  cat("/proc/%d/maps", pid);
}
```

```
55f683ebd000-55f683ec1000 r--p 00000000 08:01 1843399                    /usr/bin/ls
55f683ec1000-55f683ed6000 r-xp 00004000 08:01 1843399                    /usr/bin/ls
55f683ed6000-55f683edf000 r--p 00019000 08:01 1843399                    /usr/bin/ls
55f683edf000-55f683ee2000 rw-p 00021000 08:01 1843399                    /usr/bin/ls
55f683ee2000-55f683ee3000 rw-p 00000000 00:00 0
```

### cgroupid

**variants**

* `uint64 cgroupid(const string path)`

**compile time**

`cgroupid` retrieves the cgroupv2 ID  of the cgroup available at `path`.

```
BEGIN {
  print(cgroupid("/sys/fs/cgroup/system.slice"));
}
```

### cgroup_path

**variants**

* `cgroup_path_t cgroup_path(int cgroupid, string filter)`

Convert cgroup id to cgroup path.
This is done asynchronously in userspace when the cgroup_path value is printed,
therefore it can resolve to a different value if the cgroup id gets reassigned.
This also means that the returned value can only be used for printing.

A string literal may be passed as an optional second argument to filter cgroup
hierarchies in which the cgroup id is looked up by a wildcard expression (cgroup2
is always represented by "unified", regardless of where it is mounted).

The currently mounted hierarchy at /sys/fs/cgroup is used to do the lookup. If
the cgroup with the given id isn’t present here (e.g. when running in a Docker
container), the cgroup path won’t be found (unlike when looking up the cgroup
path of a process via /proc/.../cgroup).

```
BEGIN {
  $cgroup_path = cgroup_path(3436);
  print($cgroup_path);
  print($cgroup_path); /* This may print a different path */
  printf("%s %s", $cgroup_path, $cgroup_path); /* This may print two different paths */
}
```

### exit

**variants**

* `void exit([int code])`

**async**

Terminate bpftrace, as if a `SIGTERM` was received.
The `END` probe will still trigger (if specified) and maps will be printed.
An optional exit code can be provided.

```
BEGIN {
  exit();
}
```

Or

```
BEGIN {
  exit(1);
}
```

### join

**variants**

* `void join(char *arr[], [char * sep = ' '])`

**async**

`join` joins all the string array `arr` with `sep` as separator into one string.
This string will be printed to stdout directly, it cannot be used as string value.

The concatenation of the array members is done in BPF and the printing happens in userspace.

```
tracepoint:syscalls:sys_enter_execve {
  join(args.argv);
}
```

### kaddr

**variants**

* `uint64 kaddr(const string name)`

**compile time**

Get the address of the kernel symbol `name`.

```
interval:s:1 {
  $avenrun = kaddr("avenrun");
  $load1 = *$avenrun;
}
```

You can find all kernel symbols at `/proc/kallsyms`.

### kptr

**variants**

* `T * kptr(T * ptr)`

Marks `ptr` as a kernel address space pointer.
See the address-spaces section for more information on address-spaces.
The pointer type is left unchanged.

### kstack

**variants**

* `kstack([StackMode mode, ][int limit])`

These are implemented using BPF stack maps.

```
kprobe:ip_output { @[kstack()] = count(); }

/*
 * Sample output:
 * @[
 *  ip_output+1
 *  tcp_transmit_skb+1308
 *  tcp_write_xmit+482
 *  tcp_release_cb+225
 *  release_sock+64
 *  tcp_sendmsg+49
 *  sock_sendmsg+48
 *  sock_write_iter+135
 *   __vfs_write+247
 *  vfs_write+179
 *  sys_write+82
 *   entry_SYSCALL_64_fastpath+30
 * ]: 1708
 */
```

Sampling only three frames from the stack (limit = 3):

```
kprobe:ip_output { @[kstack(3)] = count(); }

/*
 * Sample output:
 * @[
 *  ip_output+1
 *  tcp_transmit_skb+1308
 *  tcp_write_xmit+482
 * ]: 1708
 */
```

You can also choose a different output format.
Available formats are `bpftrace`, `perf`, and `raw` (no symbolication):

```
kprobe:ip_output { @[kstack(perf, 3)] = count(); }

/*
 * Sample output:
 * @[
 *  ffffffffb4019501 do_mmap+1
 *  ffffffffb401700a sys_mmap_pgoff+266
 *  ffffffffb3e334eb sys_mmap+27
 * ]: 1708
 */
```

### ksym

**variants**

* `ksym_t ksym(uint64 addr)`

**async**

Retrieve the name of the function that contains address `addr`.
The address to name mapping happens in user-space.

The `ksym_t` type can be printed with the `%s` format specifier.

```
kprobe:do_nanosleep
{
  printf("%s\n", ksym(reg("ip")));
}

/*
 * Sample output:
 * do_nanosleep
 */
```

### macaddr

**variants**

* `macaddr_t macaddr(char [6] mac)`

Create a buffer that holds a macaddress as read from `mac`
This buffer can be printed in the canonical string format using the `%s` format specifier.

```
kprobe:arp_create {
  $stack_arg0 = *(uint8*)(reg("sp") + 8);
  $stack_arg1 = *(uint8*)(reg("sp") + 16);
  printf("SRC %s, DST %s\n", macaddr($stack_arg0), macaddr($stack_arg1));
}

/*
 * Sample output:
 * SRC 18:C0:4D:08:2E:BB, DST 74:83:C2:7F:8C:FF
 */
```

### nsecs

**variants**

* `nsecs([TimestampMode mode])`

Returns a timestamp in nanoseconds, as given by the requested kernel clock.
Defaults to `boot` if no clock is explicitly requested.

* `nsecs(monotonic)` - nanosecond timestamp since boot, exclusive of time the system spent suspended (CLOCK_MONOTONIC)
* `nsecs(boot)` - nanoseconds since boot, inclusive of time the system spent suspended (CLOCK_BOOTTIME)
* `nsecs(tai)` - TAI timestamp in nanoseconds (CLOCK_TAI)
* `nsecs(sw_tai)` - approximation of TAI timestamp in nanoseconds, is obtained through the "triple vdso sandwich" method. For older kernels without direct TAI timestamp access in BPF.

```
interval:s:1 {
  $sw_tai1 = nsecs(sw_tai);
  $tai = nsecs(tai);
  $sw_tai2 = nsecs(sw_tai);
  printf("sw_tai precision: %lldns\n", ($sw_tai1 + $sw_tai2)/2 - $tai);
}

/*
 * Sample output:
 * sw_tai precision: -98ns
 * sw_tai precision: -99ns
 * ...
 */
```

### ntop

**variants**

* `inet ntop([int64 af, ] int addr)`
* `inet ntop([int64 af, ] char addr[4])`
* `inet ntop([int64 af, ] char addr[16])`

`ntop` returns the string representation of an IPv4 or IPv6 address.
`ntop` will infer the address type (IPv4 or IPv6) based on the `addr` type and size.
If an integer or `char[4]` is given, ntop assumes IPv4, if a `char[16]` is given, ntop assumes IPv6.
You can also pass the address type (e.g. AF_INET) explicitly as the first parameter.

### offsetof

**variants**

* `offsetof(STRUCT, FIELD)`
* `offsetof(EXPRESSION, FIELD)`

**compile time**

Returns offset of the field offset bytes in struct.
Similar to kernel `offsetof` operator.
Note that subfields are not yet supported.

### override

**variants**

* `override(uint64 rc)`

**unsafe**

**Kernel** 4.16

**Helper** `bpf_override`

**Supported probes**

* kprobe

When using `override` the probed function will not be executed and instead `rc` will be returned.

```
kprobe:__x64_sys_getuid
/comm == "id"/ {
  override(2<<21);
}
```

```
uid=4194304 gid=0(root) euid=0(root) groups=0(root)
```

This feature only works on kernels compiled with `CONFIG_BPF_KPROBE_OVERRIDE` and only works on functions tagged `ALLOW_ERROR_INJECTION`.

bpftrace does not test whether error injection is allowed for the probed function, instead if will fail to load the program into the kernel:

```
ioctl(PERF_EVENT_IOC_SET_BPF): Invalid argument
Error attaching probe: 'kprobe:vfs_read'
```

### path

**variants**

* `char * path(struct path * path [, int32 size])`

**Kernel** 5.10

**Helper** `bpf_d_path`

Return full path referenced by struct path pointer in argument. If `size` is set,
the path will be clamped by `size` otherwise `BPFTRACE_MAX_STRLEN` is used.

If `size` is smaller than the resolved path, the resulting string will be truncated at the front rather than at the end.

This function can only be used by functions that are allowed to, these functions are contained in the `btf_allowlist_d_path` set in the kernel.

### percpu_kaddr

**variants**

* `void *percpu_kaddr(const string name)`
* `void *percpu_kaddr(const string name, int cpu)`

**sync**

Get the address of the percpu kernel symbol `name` for CPU `cpu`. When `cpu` is
omitted, the current CPU is used.

```
interval:s:1 {
  $proc_cnt = percpu_kaddr("process_counts");
  printf("% processes are running on CPU %d\n", *$proc_cnt, cpu);
}
```

The second variant may return NULL if `cpu` is higher than the number of
available CPUs. Therefore, it is necessary to perform a NULL-check on the result
when accessing fields of the pointed structure, otherwise the BPF program will
be rejected.

```
interval:s:1 {
  $runqueues = (struct rq *)percpu_kaddr("runqueues", 0);
  if ($runqueues != 0) {         // The check is mandatory here
    print($runqueues->nr_running);
  }
}
```

### print

**variants**

* `void print(T val)`

**async**

**variants**

* `void print(T val)`
* `void print(@map)`
* `void print(@map, uint64 top)`
* `void print(@map, uint64 top, uint64 div)`

`print` prints a the value, which can be a map or a scalar value, with the default formatting for the type.

```
interval:s:1 {
  print(123);
  print("abc");
  exit();
}

/*
 * Sample output:
 * 123
 * abc
 */
```

```
interval:ms:10 { @=hist(rand); }
interval:s:1 {
  print(@);
  exit();
}
```

Prints:

```
@:
[16M, 32M)             3 |@@@                                                 |
[32M, 64M)             2 |@@                                                  |
[64M, 128M)            1 |@                                                   |
[128M, 256M)           4 |@@@@                                                |
[256M, 512M)           3 |@@@                                                 |
[512M, 1G)            14 |@@@@@@@@@@@@@@                                      |
[1G, 2G)              22 |@@@@@@@@@@@@@@@@@@@@@@                              |
[2G, 4G)              51 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@|
```

Declared maps and histograms are automatically printed out on program termination.

Note that maps are printed by reference while scalar values are copied.
This means that updating and printing maps in a fast loop will likely result in bogus map values as the map will be updated before userspace gets the time to dump and print it.

The printing of maps supports the optional `top` and `div` arguments.
`top` limits the printing to the top N entries with the highest integer values

```
BEGIN {
  $i = 11;
  while($i) {
    @[$i] = --$i;
  }
  print(@, 2);
  clear(@);
  exit()
}

/*
 * Sample output:
 * @[9]: 9
 * @[10]: 10
 */
```

The `div` argument scales the values prior to printing them.
Scaling values before storing them can result in rounding errors.
Consider the following program:

```
kprobe:f {
  @[func] += arg0/10;
}
```

With the following sequence as numbers for arg0: `134, 377, 111, 99`.
The total is `721` which rounds to `72` when scaled by 10 but the program would print `70` due to the rounding of individual values.

Changing the print call to `print(@, 5, 2)` will take the top 5 values and scale them by 2:

```
@[6]: 3
@[7]: 3
@[8]: 4
@[9]: 4
@[10]: 5
```

### printf

**variants**

* `void printf(const string fmt, args...)`

**async**

`printf()` formats and prints data.
It behaves similar to `printf()` found in `C` and many other languages.

The format string has to be a constant, it cannot be modified at runtime.
The formatting of the string happens in user space.
Values are copied and passed by value.

bpftrace supports all the typical format specifiers like `%llx` and `%hhu`.
The non-standard ones can be found in the table below:

| Specifier |
| --- | --- | --- |
| Type | Description | r |
| buffer | Hex-formatted string to print arbitrary binary content returned by the [buf](#buf) function. | rh |

`printf()` can also symbolize enums as strings. User defined enums as well as enums
defined in the kernel are supported. For example:

```
enum custom {
  CUSTOM_ENUM = 3,
};

BEGIN {
  $r = SKB_DROP_REASON_SOCKET_FILTER;
  printf("%d, %s, %s\n", $r, $r, CUSTOM_ENUM);
  exit();
}
```

yields:

```
6, SKB_DROP_REASON_SOCKET_FILTER, CUSTOM_ENUM
```

Colors are supported too, using standard terminal escape sequences:

```
print("\033[31mRed\t\033[33mYellow\033[0m\n")
```

### pton

**variants**

* `char addr[4] pton(const string *addr_v4)`
* `char addr[16] pton(const string *addr_v6)`

**compile time**

`pton` converts a text representation of an IPv4 or IPv6 address to byte array.
`pton` infers the address family based on `.` or `:` in the given argument.
`pton` comes in handy when we need to select packets with certain IP addresses.

### reg

**variants**

* `reg(const string name)`

**Supported probes**

* kprobe
* uprobe

Get the contents of the register identified by `name`.
Valid names depend on the CPU architecture.

### signal

**variants**

* `signal(const string sig)`
* `signal(uint32 signum)`

**unsafe**

**Kernel** 5.3

**Helper** `bpf_send_signal`

Probe types: k(ret)probe, u(ret)probe, USDT, profile

Send a signal to the process being traced.
The signal can either be identified by name, e.g. `SIGSTOP` or by ID, e.g. `19` as found in `kill -l`.

```
kprobe:__x64_sys_execve
/comm == "bash"/ {
  signal(5);
}
```
```
$ ls
Trace/breakpoint trap (core dumped)
```

### sizeof

**variants**

* `sizeof(TYPE)`
* `sizeof(EXPRESSION)`

**compile time**

Returns size of the argument in bytes.
Similar to C/C++ `sizeof` operator.
Note that the expression does not get evaluated.

### skboutput

**variants**

* `uint32 skboutput(const string path, struct sk_buff *skb, uint64 length, const uint64 offset)`

**Kernel** 5.5

**Helper** bpf_skb_output

Write sk_buff `skb` 's data section to a PCAP file in the `path`, starting from `offset` to `offset` + `length`.

The PCAP file is encapsulated in RAW IP, so no ethernet header is included.
The `data` section in the struct `skb` may contain ethernet header in some kernel contexts, you may set `offset` to 14 bytes to exclude ethernet header.

Each packet’s timestamp is determined by adding `nsecs` and boot time, the accuracy varies on different kernels, see `nsecs`.

This function returns 0 on success, or a negative error in case of failure.

Environment variable `BPFTRACE_PERF_RB_PAGES` should be increased in order to capture large packets, or else these packets will be dropped.

Usage

```
# cat dump.bt
fentry:napi_gro_receive {
  $ret = skboutput("receive.pcap", args.skb, args.skb->len, 0);
}

fentry:dev_queue_xmit {
  // setting offset to 14, to exclude ethernet header
  $ret = skboutput("output.pcap", args.skb, args.skb->len, 14);
  printf("skboutput returns %d\n", $ret);
}

# export BPFTRACE_PERF_RB_PAGES=1024
# bpftrace dump.bt
...

# tcpdump -n -r ./receive.pcap  | head -3
reading from file ./receive.pcap, link-type RAW (Raw IP)
dropped privs to tcpdump
10:23:44.674087 IP 22.128.74.231.63175 > 192.168.0.23.22: Flags [.], ack 3513221061, win 14009, options [nop,nop,TS val 721277750 ecr 3115333619], length 0
10:23:45.823194 IP 100.101.2.146.53 > 192.168.0.23.46619: 17273 0/1/0 (130)
10:23:45.823229 IP 100.101.2.146.53 > 192.168.0.23.46158: 45799 1/0/0 A 100.100.45.106 (60)
```

### str

**variants**

* `str(char * data [, uint32 length)`

**Helper** `probe_read_str, probe_read_{kernel,user}_str`

`str` reads a NULL terminated (`\0`) string from `data`.
The maximum string length is limited by the `BPFTRACE_MAX_STRLEN` env variable, unless `length` is specified and shorter than the maximum.
In case the string is longer than the specified length only `length - 1` bytes are copied and a NULL byte is appended at the end.

When available (starting from kernel 5.5, see the `--info` flag) bpftrace will automatically use the `kernel` or `user` variant of `probe_read_{kernel,user}_str` based on the address space of `data`, see [Address-spaces](#Address-spaces) for more information.

### strcontains

**variants**

* `int64 strcontains(const char *haystack, const char *needle)`

`strcontains` compares whether the string haystack contains the string needle.
If needle is contained `1` is returned, else zero is returned.

bpftrace doesn’t read past the length of the shortest string.

### strerror

**variants**

* `strerror_t strerror(int error)`

Convert errno code to string.
This is done asynchronously in userspace when the strerror value is printed, hence the returned value can only be used for printing.

```
#include <errno.h>
BEGIN {
  print(strerror(EPERM));
}
```

### strftime

**variants**

* `timestamp strftime(const string fmt, int64 timestamp_ns)`

**async**

Format the nanoseconds since boot timestamp `timestamp_ns` according to the format specified by `fmt`.
The time conversion and formatting happens in user space, therefore  the `timestamp` value returned can only be used for printing using the `%s` format specifier.

bpftrace uses the `strftime(3)` function for formatting time and supports the same format specifiers.

```
interval:s:1 {
  printf("%s\n", strftime("%H:%M:%S", nsecs));
}
```

bpftrace also supports the following format string extensions:

| Specifier |
| --- | --- |
| Description | `%f` |

### strncmp

**variants**

* `int64 strncmp(char * s1, char * s2, int64 n)`

`strncmp` compares up to `n` characters string `s1` and string `s2`.
If they’re equal `0` is returned, else a non-zero value is returned.

bpftrace doesn’t read past the length of the shortest string.

The use of the `==` and `!=` operators is recommended over calling `strncmp` directly.

### system

**variants**

* `void system(string namefmt [, ...args])`

**unsafe**
**async**

`system` lets bpftrace run the specified command (`fork` and `exec`) until it completes and print its stdout.
The `command` is run with the same privileges as bpftrace and it blocks execution of the processing threads which can lead to missed events and delays processing of async events.

```
interval:s:1 {
  time("%H:%M:%S: ");
  printf("%d\n", @++);
}
interval:s:10 {
  system("/bin/sleep 10");
}
interval:s:30 {
  exit();
}
```

Note how the async `time` and `printf` first print every second until the `interval:s:10` probe hits, then they print every 10 seconds due to bpftrace blocking on `sleep`.

```
Attaching 3 probes...
08:50:37: 0
08:50:38: 1
08:50:39: 2
08:50:40: 3
08:50:41: 4
08:50:42: 5
08:50:43: 6
08:50:44: 7
08:50:45: 8
08:50:46: 9
08:50:56: 10
08:50:56: 11
08:50:56: 12
08:50:56: 13
08:50:56: 14
08:50:56: 15
08:50:56: 16
08:50:56: 17
08:50:56: 18
08:50:56: 19
```

`system` supports the same format string and arguments that `printf` does.

```
tracepoint:syscalls:sys_enter_execve {
  system("/bin/grep %s /proc/%d/status", "vmswap", pid);
}
```

### time

**variants**

* `void time(const string fmt)`

**async**

Format the current wall time according to the format specifier `fmt` and print it to stdout.
Unlike `strftime()` `time()` doesn’t send a timestamp from the probe, instead it is the time at which user-space processes the event.

bpftrace uses the `strftime(3)` function for formatting time and supports the same format specifiers.

### uaddr

**variants**

* `T * uaddr(const string sym)`

**Supported probes**

* uprobes
* uretprobes
* USDT

***Does not work with ASLR, see issue [#75](https://github.com/bpftrace/bpftrace/issues/75)***

The `uaddr` function returns the address of the specified symbol.
This lookup happens during program compilation and cannot be used dynamically.

The default return type is `uint64*`.
If the ELF object size matches a known integer size (1, 2, 4 or 8 bytes) the return type is modified to match the width (`uint8*`, `uint16*`, `uint32*` or `uint64*` resp.).
As ELF does not contain type info the type is always assumed to be unsigned.

```
uprobe:/bin/bash:readline {
  printf("PS1: %s\n", str(*uaddr("ps1_prompt")));
}
```

### uptr

**variants**

* `T * uptr(T * ptr)`

Marks `ptr` as a user address space pointer.
See the address-spaces section for more information on address-spaces.
The pointer type is left unchanged.

### ustack

**variants**

* `ustack([StackMode mode, ][int limit])`

These are implemented using BPF stack maps.

```
kprobe:do_sys_open /comm == "bash"/ { @[ustack()] = count(); }

/*
 * Sample output:
 * @[
 *  __open_nocancel+65
 *  command_word_completion_function+3604
 *  rl_completion_matches+370
 *  bash_default_completion+540
 *  attempt_shell_completion+2092
 *  gen_completion_matches+82
 *  rl_complete_internal+288
 *  rl_complete+145
 *  _rl_dispatch_subseq+647
 *  _rl_dispatch+44
 *  readline_internal_char+479
 *  readline_internal_charloop+22
 *  readline_internal+23
 *  readline+91
 *  yy_readline_get+152
 *  yy_readline_get+429
 *  yy_getc+13
 *  shell_getc+469
 *  read_token+251
 *  yylex+192
 *  yyparse+777
 *  parse_command+126
 *  read_command+207
 *  reader_loop+391
 *  main+2409
 *  __libc_start_main+231
 *  0x61ce258d4c544155
 * ]: 9
 */
```

Sampling only three frames from the stack (limit = 3):

```
kprobe:ip_output { @[ustack(3)] = count(); }

/*
 * Sample output:
 * @[
 *  __open_nocancel+65
 *  command_word_completion_function+3604
 *  rl_completion_matches+370
 * ]: 20
 */
```

You can also choose a different output format.
Available formats are `bpftrace`, `perf`, and `raw` (no symbolication):

```
kprobe:ip_output { @[ustack(perf, 3)] = count(); }

/*
 * Sample output:
 * @[
 *  5649feec4090 readline+0 (/home/mmarchini/bash/bash/bash)
 *  5649fee2bfa6 yy_readline_get+451 (/home/mmarchini/bash/bash/bash)
 *  5649fee2bdc6 yy_getc+13 (/home/mmarchini/bash/bash/bash)
 * ]: 20
 */
```

Note that for these examples to work, bash had to be recompiled with frame pointers.

### usym

**variants**

* `usym_t usym(uint64 * addr)`

**async**

**Supported probes**

* uprobes
* uretprobes

Equal to [ksym](#ksym) but resolves user space symbols.

If ASLR is enabled, user space symbolication only works when the process is running at either the time of the symbol resolution or the time of the probe attachment. The latter requires `BPFTRACE_CACHE_USER_SYMBOLS` to be set to `PER_PID`, and might not work with older versions of BCC. A similar limitation also applies to dynamically loaded symbols.

```
uprobe:/bin/bash:readline
{
  printf("%s\n", usym(reg("ip")));
}

/*
 * Sample output:
 * readline
 */
```

### unwatch

**variants**

* `void unwatch(void * addr)`

**async**

Removes a watchpoint

## Map Functions

Map functions are built-in functions who’s return value can only be assigned to maps.
The data type associated with these functions are only for internal use and are not compatible with the (integer) operators.

Functions that are marked **async** are asynchronous which can lead to unexpected behavior, see the [Invocation Mode](#invocation-mode) section for more information.

See [Advanced Topics](#advanced-topics) for more information on [Map Printing](#map-printing).

| Function Name |
| --- | --- | --- |
| Description | Sync/async | [`avg(int64 n)`](#avg) |
| Calculate the running average of `n` between consecutive calls. | Sync | [`clear(map m)`](#clear) |
| Clear all keys/values from a map. | Async | [`count()`](#count) |
| Count how often this function is called. | Sync | [`delete(map m, mapkey k)`](#delete) |
| Delete a single key from a map. | Sync | [`has_key(map m, mapkey k)`](#has_key) |
| Return true (1) if the key exists in this map. Otherwise return false (0). | Sync | [`hist(int64 n[, int k](#hist))`] |
| Create a log2 histogram of n using buckets per power of 2, 0 &lt;= k &lt;= 5, defaults to 0. | Sync | [`len(map m)`](#len) |
| Return the number of elements in a map. | Sync | [`lhist(int64 n, int64 min, int64 max, int64 step)`](#lhist) |
| Create a linear histogram of n. lhist creates M ((max - min) / step) buckets in the range [min,max) where each bucket is step in size. | Sync | [`max(int64 n)`](#max) |
| Update the map with n if n is bigger than the current value held. | Sync | [`min(int64 n)`](#min) |
| Update the map with n if n is smaller than the current value held. | Sync | [`stats(int64 n)`](#stats) |
| Combines the count, avg and sum calls into one. | Sync | [`sum(int64 n)`](#sum) |
| Calculate the sum of all n passed. | Sync | [`zero(map m)`](#zero) |

### avg

**variants**

* `avg(int64 n)`

Calculate the running average of `n` between consecutive calls.

```
interval:s:1 {
  @x++;
  @y = avg(@x);
  print(@x);
  print(@y);
}
```

Internally this keeps two values in the map: value count and running total.
The average is computed in user-space when printing by dividing the total by the
count. However, you can get the average in kernel space in expressions like
`if (@y == 5)` but this is expensive as bpftrace needs to iterate over all the
cpus to collect and sum BOTH count and total.

### clear

**variants**

* `clear(map m)`

**async**

Clear all keys/values from map `m`.

```
interval:ms:100 {
  @[rand % 10] = count();
}

interval:s:10 {
  print(@);
  clear(@);
}
```

### count

**variants**

* `count()`

Count how often this function is called.

Using `@=count()` is conceptually similar to `@++`.
The difference is that the `count()` function uses a map type optimized for
performance and correctness using cheap, thread-safe writes (PER_CPU). However, sync reads
can be expensive as bpftrace needs to iterate over all the cpus to collect and
sum these values.

Note: This differs from "raw" writes (e.g. `@++`) where multiple writers to a
shared location might lose updates, as bpftrace does not generate any atomic instructions
for `++`.

Example one:
```
BEGIN {
  @ = count();
  @ = count();
  printf("%d\n", (int64)@);   // prints 2
  exit();
}
```

Example two:
```
interval:ms:100 {
  @ = count();
}

interval:s:10 {
  // async read
  print(@);
  // sync read
  if (@ > 10) {
    print(("hello"));
  }
  clear(@);
}
```

### delete

**variants**

* `delete(map m, mapkey k)`
* deprecated `delete(mapkey k)`

Delete a single key from a map.
For scalar maps (e.g. no explicit keys), the key is omitted and is equivalent to calling `clear`.
For map keys that are composed of multiple values (e.g. `@mymap[3, "hello"] = 1` - remember these values are represented as a tuple) the syntax would be: `delete(@mymap, (3, "hello"));`

The, now deprecated, API (supported in version &lt;= 0.21.x) of passing map arguments with the key is still supported:
e.g. `delete(@mymap[3, "hello"]);`.

```
kprobe:dummy {
  @scalar = 1;
  delete(@scalar); // ok
  @single["hello"] = 1;
  delete(@single, "hello"); // ok
  @associative[1,2] = 1;
  delete(@associative, (1,2)); // ok
  delete(@associative); // error
  delete(@associative, 1); // error

    // deprecated but ok
    delete(@single["hello"]);
    delete(@associative[1, 2]);
}
```

### has_key

**variants**

* `int has_key(map m, mapkey k)`

Return true (1) if the key exists in this map.
Otherwise return false (0).
Error if called with a map that has no keys (aka scalar map).
Return value can also be used for scratch variables and map keys/values.

```
kprobe:dummy {
  @associative[1,2] = 1;
  if (!has_key(@associative, (1,3))) { // ok
    print(("bye"));
  }

    @scalar = 1;
    if (has_key(@scalar)) { // error
      print(("hello"));
    }

    $a = has_key(@associative, (1,2)); // ok
    @b[has_key(@associative, (1,2))] = has_key(@associative, (1,2)); // ok
}
```

### hist

**variants**

* `hist(int64 n[, int k])`

Create a log2 histogram of `n` using $2^k$ buckets per power of 2,
0 &lt;= k &lt;= 5, defaults to 0.

```
kretprobe:vfs_read {
  @bytes = hist(retval);
}
```

Prints:

```
@:
[1M, 2M)               3 |                                                    |
[2M, 4M)               2 |                                                    |
[4M, 8M)               2 |                                                    |
[8M, 16M)              6 |                                                    |
[16M, 32M)            16 |                                                    |
[32M, 64M)            27 |                                                    |
[64M, 128M)           48 |@                                                   |
[128M, 256M)          98 |@@@                                                 |
[256M, 512M)         191 |@@@@@@                                              |
[512M, 1G)           394 |@@@@@@@@@@@@@                                       |
[1G, 2G)             820 |@@@@@@@@@@@@@@@@@@@@@@@@@@@                         |
```

### len

**variants**

* `len(map m)`

Return the number of elements in the map.

### lhist

**variants**

* `lhist(int64 n, int64 min, int64 max, int64 step)`

Create a linear histogram of `n`.
`lhist` creates `M` (`(max - min) / step`) buckets in the range `[min,max)` where each bucket is `step` in size.
Values in the range `(-inf, min)` and `(max, inf)` get their get their own bucket too, bringing the total amount of buckets created to `M+2`.

```
interval:ms:1 {
  @ = lhist(rand %10, 0, 10, 1);
}

interval:s:5 {
  exit();
}
```

Prints:

```
@:
[0, 1)               306 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@         |
[1, 2)               284 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@            |
[2, 3)               294 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@          |
[3, 4)               318 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@       |
[4, 5)               311 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@        |
[5, 6)               362 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@|
[6, 7)               336 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    |
[7, 8)               326 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@      |
[8, 9)               328 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     |
[9, 10)              318 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@       |
```

### max

**variants**

* `max(int64 n)`

Update the map with `n` if `n` is bigger than the current value held.
Similar to `count` this uses a PER_CPU map (thread-safe, fast writes, slow reads).

Note: this is different than the typical userspace `max()` in that bpftrace’s `max()`
only takes a single argument. The logical "other" argument to compare to is the value
in the map the "result" is being assigned to.

For example, compare the two logically equivalent samples (C++ vs bpftrace):

In C++:
```
int x = std::max(3, 33);  // x contains 33
```

In bpftrace:
```
@x = max(3);
@x = max(33);   // @x contains 33
```

Also note that bpftrace takes care to handle the unset case. In other words,
there is no default value. The first value you pass to `max()` will always
be returned.

### min

**variants**

* `min(int64 n)`

Update the map with `n` if `n` is smaller than the current value held.
Similar to `count` this uses a PER_CPU map (thread-safe, fast writes, slow reads).

See `max()` above for how this differs from the typical userspace `min()`.

### stats

**variants**

* `stats(int64 n)`

`stats` combines the `count`, `avg` and `sum` calls into one.

```
kprobe:vfs_read {
  @bytes[comm] = stats(arg2);
}
```

```
@bytes[bash]: count 7, average 1, total 7
@bytes[sleep]: count 5, average 832, total 4160
@bytes[ls]: count 7, average 886, total 6208
@
```

### sum

**variants**

* `sum(int64 n)`

Calculate the sum of all `n` passed.

Using `@=sum(5)` is conceptually similar to `@+=5`.
The difference is that the `sum()` function uses a map type optimized for
performance and correctness using cheap, thread-safe writes (PER_CPU). However, sync reads
can be expensive as bpftrace needs to iterate over all the cpus to collect and
sum these values.

Note: This differs from "raw" writes (e.g. `@+=5`) where multiple writers to a
shared location might lose updates, as bpftrace does not generate any implicit
atomic operations.

Example one:
```
BEGIN {
  @ = sum(5);
  @ = sum(6);
  printf("%d\n", (int64)@);   // prints 11
  clear(@);
  exit();
}
```

Example two:
```
interval:ms:100 {
  @ = sum(5);
}

interval:s:10 {
  // async read
  print(@);
  // sync read
  if (@ > 10) {
    print(("hello"));
  }
  clear(@);
}
```

### zero

**variants**

* `zero(map m)`

**async**

Set all values for all keys to zero.

## Probes

bpftrace supports various probe types which allow the user to attach BPF programs to different types of events.
Each probe starts with a provider (e.g. `kprobe`) followed by a colon (`:`) separated list of options.
The amount of options and their meaning depend on the provider and are detailed below.
The valid values for options can depend on the system or binary being traced, e.g. for uprobes it depends on the binary.
Also see [Listing Probes](#listing-probes).

It is possible to associate multiple probes with a single action as long as the action is valid for all specified probes.
Multiple probes can be specified as a comma (`,`) separated list:

```
kprobe:tcp_reset,kprobe:tcp_v4_rcv {
  printf("Entered: %s\n", probe);
}
```

Wildcards are supported too:

```
kprobe:tcp_* {
  printf("Entered: %s\n", probe);
}
```

Both can be combined:

```
kprobe:tcp_reset,kprobe:*socket* {
  printf("Entered: %s\n", probe);
}
```

Most providers also support a short name which can be used instead of the full name, e.g. `kprobe:f` and `k:f` are identical.

|     |     |     |     |
| --- | --- | --- | --- |
| **Probe Name** | **Short Name** | **Description** | **Kernel/User Level** |
| [`BEGIN/END`](#begin/end) | - | Built-in events | Kernel/User |
| [`self`](#self) | - | Built-in events | Kernel/User |
| [`hardware`](#hardware) | `h` | Processor-level events | Kernel |
| [`interval`](#interval) | `i` | Timed output | Kernel/User |
| [`iter`](#iterator) | `it` | Iterators tracing | Kernel |
| [`fentry/fexit`](#fentry-and-fexit) | `f`/`fr` | Kernel functions tracing with BTF support | Kernel |
| [`kprobe/kretprobe`](#kprobe-and-kretprobe) | `k`/`kr` | Kernel function start/return | Kernel |
| [`profile`](#profile) | `p` | Timed sampling | Kernel/User |
| [`rawtracepoint`](#rawtracepoint) | `rt` | Kernel static tracepoints with raw arguments | Kernel |
| [`software`](#software) | `s` | Kernel software events | Kernel |
| [`tracepoint`](#tracepoint) | `t` | Kernel static tracepoints | Kernel |
| [`uprobe/uretprobe`](#uprobe,-uretprobe) | `u`/`ur` | User-level function start/return | User |
| [`usdt`](#usdt) | `U` | User-level static tracepoints | User |
| [`watchpoint/asyncwatchpoint`](#watchpoint-and-asyncwatchpoint) | `w`/`aw` | Memory watchpoints | Kernel |

### BEGIN/END

These are special built-in events provided by the bpftrace runtime.
`BEGIN` is triggered before all other probes are attached.
`END` is triggered after all other probes are detached.

Note that specifying an `END` probe doesn’t override the printing of 'non-empty' maps at exit.
To prevent printing all used maps need be cleared in the `END` probe:

```
END {
    clear(@map1);
    clear(@map2);
}
```

### self

**variants**

* `self:signal:SIGUSR1`

These are special built-in events provided by the bpftrace runtime.
The trigger function is called by the bpftrace runtime when the bpftrace process receives specific events, such as a `SIGUSR1` signal.
When multiple signal handlers are attached to the same signal, only the first one is used.

```
self:signal:SIGUSR1 {
  print("abc");
}
```

### hardware

**variants**

* `hardware:event_name:`
* `hardware:event_name:count`

**short name**

* `h`

These are the pre-defined hardware events provided by the Linux kernel, as commonly traced by the perf utility.
They are implemented using performance monitoring counters (PMCs): hardware resources on the processor.
There are about ten of these, and they are documented in the perf_event_open(2) man page.
The event names are:

* `cpu-cycles` or `cycles`
* `instructions`
* `cache-references`
* `cache-misses`
* `branch-instructions` or `branches`
* `branch-misses`
* `bus-cycles`
* `frontend-stalls`
* `backend-stalls`
* `ref-cycles`

The `count` option specifies how many events must happen before the probe fires (sampling interval).
If `count` is left unspecified a default value is used.

This will fire once for every 1,000,000 cache misses.

```
hardware:cache-misses:1e6 { @[pid] = count(); }
```

### interval

**variants**

* `interval:us:count`
* `interval:ms:count`
* `interval:s:count`
* `interval:hz:rate`

**short name**

* `i`

The interval probe fires at a fixed interval as specified by its time spec.
Interval fires on one CPU at a time, unlike [profile](#profile) probes.

This prints the rate of syscalls per second.

```
tracepoint:raw_syscalls:sys_enter { @syscalls = count(); }
interval:s:1 { print(@syscalls); clear(@syscalls); }
```

### iterator

**variants**

* `iter:task`
* `iter:task:pin`
* `iter:task_file`
* `iter:task_file:pin`
* `iter:task_vma`
* `iter:task_vma:pin`

**short name**

* `it`

***Warning*** this feature is experimental and may be subject to interface changes.

These are eBPF iterator probes that allow iteration over kernel objects.
Iterator probe can’t be mixed with any other probe, not even another iterator.
Each iterator probe provides a set of fields that could be accessed with the
ctx pointer. Users can display the set of available fields for each iterator via
-lv options as described below.

```
iter:task { printf("%s:%d\n", ctx->task->comm, ctx->task->pid); }

/*
 * Sample output:
 * systemd:1
 * kthreadd:2
 * rcu_gp:3
 * rcu_par_gp:4
 * kworker/0:0H:6
 * mm_percpu_wq:8
 */
```

```
iter:task_file {
  printf("%s:%d %d:%s\n", ctx->task->comm, ctx->task->pid, ctx->fd, path(ctx->file->f_path));
}

/*
 * Sample output:
 * systemd:1 1:/dev/null
 * systemd:1 3:/dev/kmsg
 * ...
 * su:1622 2:/dev/pts/1
 * ...
 * bpftrace:1892 2:/dev/pts/1
 * bpftrace:1892 6:anon_inode:bpf-prog
 */
```

```
iter:task_vma {
  printf("%s %d %lx-%lx\n", comm, pid, ctx->vma->vm_start, ctx->vma->vm_end);
}

/*
 * Sample output:
 * bpftrace 119480 55b92c380000-55b92c386000
 * ...
 * bpftrace 119480 7ffd55dde000-7ffd55de2000
 */
```

It’s possible to pin an iterator by specifying the optional probe ':pin' part, that defines the pin file.
It can be specified as an absolute or relative path to /sys/fs/bpf.

**relative pin**

```
iter:task:list { printf("%s:%d\n", ctx->task->comm, ctx->task->pid); }

/*
 * Sample output:
 * Program pinned to /sys/fs/bpf/list
 */
```

**absolute pin**

```
iter:task_file:/sys/fs/bpf/files {
  printf("%s:%d %s\n", ctx->task->comm, ctx->task->pid, path(ctx->file->f_path));
}

/*
 * Sample output:
 * Program pinned to /sys/fs/bpf/files
 */
```

### fentry and fexit

**variants**

* `fentry[:module]:fn`
* `fexit[:module]:fn`

**short names**

* `f` (`fentry`)
* `fr` (`fexit`)

**requires (`--info`)**

* Kernel features:BTF
* Probe types:fentry

``fentry``/``fexit`` probes attach to kernel functions similar to [kprobe and kretprobe](#kprobe-and-kretprobe).
They make use of eBPF trampolines which allow kernel code to call into BPF programs with near zero overhead.
Originally, these were called `kfunc` and `kretfunc` but were later renamed to `fentry` and `fexit` to match
how these are referenced in the kernel and to prevent confusion with [BPF Kernel Functions](https://docs.kernel.org/bpf/kfuncs.html).
The original names are still supported for backwards compatibility.

``fentry``/``fexit`` probes make use of BTF type information to derive the type of function arguments at compile time.
This removes the need for manual type casting and makes the code more resilient against small signature changes in the kernel.
The function arguments are available in the `args` struct which can be inspected by doing verbose listing (see [Listing Probes](#listing-probes)).
These arguments are also available in the return probe (`fexit`), unlike `kretprobe`.

```
# bpftrace -lv 'fentry:tcp_reset'

fentry:tcp_reset
    struct sock * sk
    struct sk_buff * skb
```

```
fentry:x86_pmu_stop {
  printf("pmu %s stop\n", str(args.event->pmu->name));
}
```

The fget function takes one argument as file descriptor and you can access it via args.fd and the return value is accessible via retval:

```
fexit:fget {
  printf("fd %d name %s\n", args.fd, str(retval->f_path.dentry->d_name.name));
}

/*
 * Sample output:
 * fd 3 name ld.so.cache
 * fd 3 name libselinux.so.1
 */
```

### kprobe and kretprobe

**variants**

* `kprobe[:module]:fn`
* `kprobe[:module]:fn+offset`
* `kretprobe[:module]:fn`

**short names**

* `k`
* `kr`

``kprobe``s allow for dynamic instrumentation of kernel functions.
Each time the specified kernel function is executed the attached BPF programs are ran.

```
kprobe:tcp_reset {
  @tcp_resets = count()
}
```

Function arguments are available through the `argN` for register args. Arguments passed on stack are available using the stack pointer, e.g. `$stack_arg0 = **(int64**)reg("sp") + 16`.
Whether arguments passed on stack or in a register depends on the architecture and the number or arguments used, e.g. on x86_64 the first 6 non-floating point arguments are passed in registers and all following arguments are passed on the stack.
Note that floating point arguments are typically passed in special registers which don’t count as `argN` arguments which can cause confusion.
Consider a function with the following signature:

```
void func(int a, double d, int x)
```

Due to `d` being a floating point, `x` is accessed through `arg1` where one might expect `arg2`.

bpftrace does not detect the function signature so it is not aware of the argument count or their type.
It is up to the user to perform [Type conversion](#type-conversion) when needed, e.g.

```
#include <linux/path.h>
#include <linux/dcache.h>

kprobe:vfs_open
{
	printf("open path: %s\n", str(((struct path *)arg0)->dentry->d_name.name));
}
```

Here arg0 was cast as a (struct path *), since that is the first argument to vfs_open.
The struct support is the same as bcc and based on available kernel headers.
This means that many, but not all, structs will be available, and you may need to manually define structs.

If the kernel has BTF (BPF Type Format) data, all kernel structs are always available without defining them. For example:

```
kprobe:vfs_open {
  printf("open path: %s\n", str(((struct path *)arg0)->dentry->d_name.name));
}
```

You can optionally specify a kernel module, either to include BTF data from that module, or to specify that the traced function should come from that module.

```
kprobe:kvm:x86_emulate_insn
{
  $ctxt = (struct x86_emulate_ctxt *) arg0;
  printf("eip = 0x%lx\n", $ctxt->eip);
}
```

See [BTF Support](#btf-support) for more details.

`kprobe` s are not limited to function entry, they can be attached to any instruction in a function by specifying an offset from the start of the function.

`kretprobe` s trigger on the return from a kernel function.
Return probes do not have access to the function (input) arguments, only to the return value (through `retval`).
A common pattern to work around this is by storing the arguments in a map on function entry and retrieving in the return probe:

```
kprobe:d_lookup
{
	$name = (struct qstr *)arg1;
	@fname[tid] = $name->name;
}

kretprobe:d_lookup
/@fname[tid]/
{
	printf("%-8d %-6d %-16s M %s\n", elapsed / 1e6, pid, comm,
	    str(@fname[tid]));
}
```

### profile

**variants**

* `profile:us:count`
* `profile:ms:count`
* `profile:s:count`
* `profile:hz:rate`

**short name**

* `p`

Profile probes fire on each CPU on the specified interval.
These operate using perf_events (a Linux kernel facility, which is also used by the perf command).

```
profile:hz:99 { @[tid] = count(); }
```

### rawtracepoint

**variants**

* `rawtracepoint:event`

**short name**

* `rt`

The hook point triggered by `tracepoint` and `rawtracepoint` is the same.
`tracepoint` and `rawtracepoint` are nearly identical in terms of functionality.
The only difference is in the program context.
`rawtracepoint` offers raw arguments to the tracepoint while `tracepoint` applies further processing to the raw arguments.
The additional processing is defined inside the kernel.

```
rawtracepoint:block_rq_insert {
  printf("%llx %llx\n", arg0, arg1);
}
```

Tracepoint arguments are available via the `argN` builtins.
Each arg is a 64-bit integer.
The available arguments can be found in the relative path of the kernel source code `include/trace/events/`. For example:

```
include/trace/events/block.h
DEFINE_EVENT(block_rq, block_rq_insert,
	TP_PROTO(struct request_queue *q, struct request *rq),
	TP_ARGS(q, rq)
);
```

### software

**variants**

* `software:event:`
* `software:event:count`

**short name**

* `s`

These are the pre-defined software events provided by the Linux kernel, as commonly traced via the perf utility.
They are similar to tracepoints, but there is only about a dozen of these, and they are documented in the perf_event_open(2) man page.
If the count is not provided, a default is used.

The event names are:

* `cpu-clock` or `cpu`
* `task-clock`
* `page-faults` or `faults`
* `context-switches` or `cs`
* `cpu-migrations`
* `minor-faults`
* `major-faults`
* `alignment-faults`
* `emulation-faults`
* `dummy`
* `bpf-output`

```
software:faults:100 { @[comm] = count(); }
```

This roughly counts who is causing page faults, by sampling the process name for every one in one hundred faults.

### tracepoint

**variants**

* `tracepoint:subsys:event`

**short name**

* `t`

Tracepoints are hooks into events in the kernel.
Tracepoints are defined in the kernel source and compiled into the kernel binary which makes them a form of static tracing.
Unlike `kprobe` s, new tracepoints cannot be added without modifying the kernel.

The advantage of tracepoints is that they generally provide a more stable interface than `kprobe` s do, they do not depend on the existence of a kernel function.

```
tracepoint:syscalls:sys_enter_openat {
  printf("%s %s\n", comm, str(args.filename));
}
```

Tracepoint arguments are available in the `args` struct which can be inspected with verbose listing, see the [Listing Probes](#listing-probes) section for more details.

```
# bpftrace -lv "tracepoint:*"

tracepoint:xhci-hcd:xhci_setup_device_slot
  u32 info
  u32 info2
  u32 tt_info
  u32 state
...
```

Alternatively members for each tracepoint can be listed from their /format file in /sys.

Apart from the filename member, we can also print flags, mode, and more.
After the "common" members listed first, the members are specific to the tracepoint.

**Additional information**

* https://www.kernel.org/doc/html/latest/trace/tracepoints.html

### uprobe, uretprobe

**variants**

* `uprobe:binary:func`
* `uprobe:binary:func+offset`
* `uprobe:binary:offset`
* `uretprobe:binary:func`

**short names**

* `u`
* `ur`

`uprobe` s or user-space probes are the user-space equivalent of `kprobe` s.
The same limitations that apply [kprobe and kretprobe](#kprobe-and-kretprobe) also apply to `uprobe` s and `uretprobe` s, namely: arguments are available via the `argN` and `sargN` builtins and can only be accessed with a uprobe (`sargN` is more common for older versions of golang).
retval is the return value for the instrumented function and can only be accessed with a uretprobe.

```
uprobe:/bin/bash:readline { printf("arg0: %d\n", arg0); }
```

What does arg0 of readline() in /bin/bash contain?
I don’t know, so I’ll need to look at the bash source code to find out what its arguments are.

When tracing libraries, it is sufficient to specify the library name instead of
a full path. The path will be then automatically resolved using `/etc/ld.so.cache`:

```
uprobe:libc:malloc { printf("Allocated %d bytes\n", arg0); }
```

If the traced binary has DWARF included, function arguments are available in the `args` struct which can be inspected with verbose listing, see the [Listing Probes](#listing-probes) section for more details.

```
# bpftrace -lv 'uprobe:/bin/bash:rl_set_prompt'

uprobe:/bin/bash:rl_set_prompt
    const char* prompt
```

When tracing C++ programs, it’s possible to turn on automatic symbol demangling by using the `:cpp` prefix:

```
# bpftrace:cpp:"bpftrace::BPFtrace::add_probe" { ... }
```

It is important to note that for `uretprobe` s to work the kernel runs a special helper on user-space function entry which overrides the return address on the stack.
This can cause issues with languages that have their own runtime like Golang:

**example.go**

```
func myprint(s string) {
  fmt.Printf("Input: %s\n", s)
}

func main() {
  ss := []string{"a", "b", "c"}
  for _, s := range ss {
    go myprint(s)
  }
  time.Sleep(1*time.Second)
}
```

**bpftrace**

```
# bpftrace -e 'uretprobe:./test:main.myprint { @=count(); }' -c ./test
runtime: unexpected return pc for main.myprint called from 0x7fffffffe000
stack: frame={sp:0xc00008cf60, fp:0xc00008cfd0} stack=[0xc00008c000,0xc00008d000)
fatal error: unknown caller pc
```

### usdt

**variants**

* `usdt:binary_path:probe_name`
* `usdt:binary_path:[probe_namespace]:probe_name`
* `usdt:library_path:probe_name`
* `usdt:library_path:[probe_namespace]:probe_name`

**short name**

* `U`

Where probe_namespace is optional if probe_name is unique within the binary.

You can target the entire host (or an entire process’s address space by using the `-p` arg) by using a single wildcard in place of the binary_path/library_path:

```
usdt:*:loop { printf("hi\n"); }
```

Please note that if you use wildcards for the probe_name or probe_namespace and end up targeting multiple USDTs for the same probe you might get errors if you also utilize the USDT argument builtin (e.g. arg0) as they could be of different types.

Arguments are available via the `argN` builtins:

```
usdt:/root/tick:loop { printf("%s: %d\n", str(arg0), arg1); }
```

bpftrace also supports USDT semaphores.
If both your environment and bpftrace support uprobe refcounts, then USDT semaphores are automatically activated for all processes upon probe attachment (and --usdt-file-activation becomes a noop).
You can check if your system supports uprobe refcounts by running:

```
# bpftrace --info 2>&1 | grep "uprobe refcount"
bcc bpf_attach_uprobe refcount: yes
  uprobe refcount (depends on Build:bcc bpf_attach_uprobe refcount): yes
```

If your system does not support uprobe refcounts, you may activate semaphores by passing in -p $PID or --usdt-file-activation.
--usdt-file-activation looks through /proc to find processes that have your probe’s binary mapped with executable permissions into their address space and then tries to attach your probe.
Note that file activation occurs only once (during attach time).
In other words, if later during your tracing session a new process with your executable is spawned, your current tracing session will not activate the new process.
Also note that --usdt-file-activation matches based on file path.
This means that if bpftrace runs from the root host, things may not work as expected if there are processes execved from private mount namespaces or bind mounted directories.
One workaround is to run bpftrace inside the appropriate namespaces (i.e. the container).

### watchpoint and asyncwatchpoint

**variants**

* `watchpoint:absolute_address:length:mode`
* `watchpoint:function+argN:length:mode`

**short names**

* `w`
* `aw`

This feature is experimental and may be subject to interface changes.
Memory watchpoints are also architecture dependent.

These are memory watchpoints provided by the kernel.
Whenever a memory address is written to (`w`), read
from (`r`), or executed (`x`), the kernel can generate an event.

In the first form, an absolute address is monitored.
If a pid (`-p`) or a command (`-c`) is provided, bpftrace takes the address as a userspace address and monitors the appropriate process.
If not, bpftrace takes the address as a kernel space address.

In the second form, the address present in `argN` when `function` is entered is
monitored.
A pid or command must be provided for this form.
If synchronous (`watchpoint`), a `SIGSTOP` is sent to the tracee upon function entry.
The tracee will be ``SIGCONT``ed after the watchpoint is attached.
This is to ensure events are not missed.
If you want to avoid the `SIGSTOP` + `SIGCONT` use `asyncwatchpoint`.

Note that on most architectures you may not monitor for execution while monitoring read or write.

```
# bpftrace -e 'watchpoint:0x10000000:8:rw { printf("hit!\n"); }' -c ./testprogs/watchpoint
```

Print the call stack every time the `jiffies` variable is updated:

```
watchpoint:0x$(awk '$3 == "jiffies" {print $1}' /proc/kallsyms):8:w {
  @[kstack] = count();
}
```

"hit" and exit when the memory pointed to by `arg1` of `increment` is written to:

```C
# cat wpfunc.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

__attribute__((noinline))
void increment(__attribute__((unused)) int _, int *i)
{
  (*i)++;
}

int main()
{
  int *i = malloc(sizeof(int));
  while (1)
  {
    increment(0, i);
    (*i)++;
    usleep(1000);
  }
}
```

```
# bpftrace -e 'watchpoint:increment+arg1:4:w { printf("hit!\n"); exit() }' -c ./wpfunc
```

## Config Variables

Some behavior can only be controlled through config variables, which are listed here.
These can be set via the [Config Block](#config-block) directly in a script (before any probes) or via their environment variable equivalent, which is upper case and includes the `BPFTRACE_` prefix e.g. ``stack_mode`’s environment variable would be `BPFTRACE_STACK_MODE`.

### cache_user_symbols

Default: PER_PROGRAM if ASLR disabled or `-c` option given, PER_PID otherwise.

* PER_PROGRAM - each program has its own cache. If there are more processes with enabled ASLR for a single program, this might produce incorrect results.
* PER_PID - each process has its own cache. This is accurate for processes with ASLR enabled, and enables bpftrace to preload caches for processes running at probe attachment ti
me.
If there are many processes running, it will consume a lot of a memory.
* NONE - caching disabled. This saves the most memory, but at the cost of speed.

### cpp_demangle

Default: 1

C++ symbol demangling in userspace stack traces is enabled by default.

This feature can be turned off by setting the value of this environment variable to `0`.

### lazy_symbolication

Default: 0

For user space symbols, symbolicate lazily/on-demand (1) or symbolicate everything ahead of time (0).

### log_size

Default: 1000000

Log size in bytes.

### max_bpf_progs

Default: 512

This is the maximum number of BPF programs (functions) that bpftrace can generate.
The main purpose of this limit is to prevent bpftrace from hanging since generating a lot of probes
takes a lot of resources (and it should not happen often).

### max_cat_bytes

Default: 10000

Maximum bytes read by cat builtin.

### max_map_keys

Default: 4096

This is the maximum number of keys that can be stored in a map.
Increasing the value will consume more memory and increase startup times.
There are some cases where you will want to, for example: sampling stack traces, recording timestamps for each page, etc.

### max_probes

Default: 512

This is the maximum number of probes that bpftrace can attach to.
Increasing the value will consume more memory, increase startup times, and can incur high performance overhead or even freeze/crash the
system.

### max_strlen

Default: 64

The maximum length (in bytes) for values created by `str()`, `buf()` and `path()`.

This limit is necessary because BPF requires the size of all dynamically-read strings (and similar) to be declared up front. This is the size for all strings (and similar) in bpftrace unless specified at the call site.
There is no artificial limit on what you can tune this to. But you may be wasting resources (memory and cpu) if you make this too high.

### max_type_res_iterations

Default: 0

Maximum number of levels of nested field accesses for tracepoint args.
0 is unlimited.

### missing_probes

Default: `warn`

Controls handling of probes with multiple kprobe or uprobe attach points which
cannot be attached to some functions because they do not exist in the kernel or
in the traced binary.

The possible options are:
- `error` - always fail on missing probes
- `warn` - print a warning but continue execution
- `ignore` - silently ignore missing probes

### on_stack_limit

Default: 32

The maximum size (in bytes) of individual objects that will be stored on the BPF stack. If they are larger than this limit they will be stored in pre-allocated memory.

This exists because the BPF stack is limited to 512 bytes and large objects make it more likely that we’ll run out of space. bpftrace can store objects that are larger than the `on_stack_limit` in pre-allocated memory to prevent this stack error. However, storing in pre-allocated memory may be less memory efficient. Lower this default number if you are still seeing a stack memory error or increase it if you’re worried about memory consumption.

### perf_rb_pages

Default: 64

Number of pages to allocate per CPU perf ring buffer.
The value must be a power of 2.
If you’re getting a lot of dropped events bpftrace may not be processing events in the ring buffer fast enough.
It may be useful to bump the value higher so more events can be queued up.
The tradeoff is that bpftrace will use more memory.

### stack_mode

Default: bpftrace

Output format for ustack and kstack builtins.
Available modes/formats:

* bpftrace
* perf
* raw: no symbolication

This can be overwritten at the call site.

### str_trunc_trailer

Default: `..`

Trailer to add to strings that were truncated.
Set to empty string to disable truncation trailers.

### print_maps_on_exit

Default: 1

Controls whether maps are printed on exit. Set to `0` in order to change the default behavior and not automatically print maps at program exit.

### symbol_source

Default: `dwarf` if `bpftrace` is compiled with LLDB, `symbol_table` otherwise

Choose how bpftrace will resolve all `uprobe` symbol locations.

Available options:

* `dwarf` - locate uprobes using DebugInfo, which yields more accurate stack traces (`ustack`). Fall back to the Symbol Table if it can’t locate the probe using DebugInfo.
* `symbol_table` - don’t use DebugInfo and rely on the ELF Symbol Table instead.

If the DebugInfo was rewritten by a post-linkage optimisation tool (like BOLT or AutoFDO), it might yield an incorrect address for a probe location.
This config can force using the Symbol Table, for when the DebugInfo returns invalid addresses.

## Environment Variables

These are not available as part of the standard set of [Config Variables](#config-variables) and can only be set as environment variables.

### BPFTRACE_BTF

Default: None

The path to a BTF file. By default, bpftrace searches several locations to find a BTF file.
See src/btf.cpp for the details.

### BPFTRACE_DEBUG_OUTPUT

Default: 0

Outputs bpftrace’s runtime debug messages to the trace_pipe. This feature can be turned on by setting
the value of this environment variable to `1`.

### BPFTRACE_KERNEL_BUILD

Default: `/lib/modules/$(uname -r)`

Only used with `BPFTRACE_KERNEL_SOURCE` if it is out-of-tree Linux kernel build.

### BPFTRACE_KERNEL_SOURCE

Default: `/lib/modules/$(uname -r)`

bpftrace requires kernel headers for certain features, which are searched for in this directory.

### BPFTRACE_VMLINUX

Default: None

This specifies the vmlinux path used for kernel symbol resolution when attaching kprobe to offset.
If this value is not given, bpftrace searches vmlinux from pre defined locations.
See src/attached_probe.cpp:find_vmlinux() for details.

## Options Expanded

### Debug Output

The `-d STAGE` option produces debug output. It prints the output of the
bpftrace execution stage given by the _STAGE_ argument. The option can be used
multiple times (with different stage names) and the special value `all` prints
the output of all the supported stages. The option also takes multiple stages
in one invocation as comma separated values.

Note: This is primarily used for bpftrace developers.

The supported options are:

|     |     |
| --- | --- |
| `ast` | Prints the Abstract Syntax Tree (AST) after every pass. |
| `codegen` | Prints the unoptimized LLVM IR as produced by `CodegenLLVM`. |
| `codegen-opt` | Prints the optimized LLVM IR, i.e. the code which will be compiled into BPF bytecode. |
| `dis` | Disassembles and prints out the generated bytecode that `libbpf` will see. Only available in debug builds. |
| `libbpf` | Captures and prints libbpf log for all libbpf operations that bpftrace uses. |
| `verifier` | Captures and prints the BPF verifier log. |
| `all` | Prints the output of all of the above stages. |

### Listing Probes

Probe listing is the method to discover which probes are supported by the current system.
Listing supports the same syntax as normal attachment does and alternatively can be
combined with `-e` or filename args to see all the probes that a program would attach to.

```
# bpftrace -l 'kprobe:*'
# bpftrace -l 't:syscalls:*openat*
# bpftrace -l 'kprobe:tcp*,trace
# bpftrace -l 'k:*socket*,tracepoint:syscalls:*tcp*'
# bpftrace -l -e 'tracepoint:xdp:mem_* { exit(); }'
# bpftrace -l my_script.bt
# bpftrace -lv 'enum cpu_usage_stat'
```

The verbose flag (`-v`) can be specified to inspect arguments (`args`) for providers that support it:

```
# bpftrace -l 'fexit:tcp_reset,tracepoint:syscalls:sys_enter_openat' -v
fexit:tcp_reset
    struct sock * sk
    struct sk_buff * skb
tracepoint:syscalls:sys_enter_openat
    int __syscall_nr
    int dfd
    const char * filename
    int flags
    umode_t mode

# bpftrace -l 'uprobe:/bin/bash:rl_set_prompt' -v    # works only if /bin/bash has DWARF
uprobe:/bin/bash:rl_set_prompt
    const char *prompt

# bpftrace -lv 'struct css_task_iter'
struct css_task_iter {
        struct cgroup_subsys *ss;
        unsigned int flags;
        struct list_head *cset_pos;
        struct list_head *cset_head;
        struct list_head *tcset_pos;
        struct list_head *tcset_head;
        struct list_head *task_pos;
        struct list_head *cur_tasks_head;
        struct css_set *cur_cset;
        struct css_set *cur_dcset;
        struct task_struct *cur_task;
        struct list_head iters_node;
};
```

### Preprocessor Options

The `-I` option can be used to add directories to the list of directories that bpftrace uses to look for headers.
Can be defined multiple times.

```
# cat program.bt
#include <foo.h>

BEGIN { @ = FOO }

# bpftrace program.bt

definitions.h:1:10: fatal error: 'foo.h' file not found

# /tmp/include
foo.h

# bpftrace -I /tmp/include program.bt

Attaching 1 probe...
```

The `--include` option can be used to include headers by default.
Can be defined multiple times.
Headers are included in the order they are defined, and they are included before any other include in the program being executed.

```
# bpftrace --include linux/path.h --include linux/dcache.h \
    -e 'kprobe:vfs_open { printf("open path: %s\n", str(((struct path *)arg0)->dentry->d_name.name)); }'

Attaching 1 probe...
open path: .com.google.Chrome.ASsbu2
open path: .com.google.Chrome.gimc10
open path: .com.google.Chrome.R1234s
```

### Verbose Output

The `-v` option prints more information about the program as it is run:

```
# bpftrace -v -e 'tracepoint:syscalls:sys_enter_nanosleep { printf("%s is sleeping.\n", comm); }'
AST node count: 7
Attaching 1 probe...

load tracepoint:syscalls:sys_enter_nanosleep, with BTF, with func_infos: Success

Program ID: 111
Attaching tracepoint:syscalls:sys_enter_nanosleep
iscsid is sleeping.
iscsid is sleeping.
[...]
```

## Advanced Topics

### Address Spaces

Kernel and user pointers live in different address spaces which, depending on the CPU architecture, might overlap.
Trying to read a pointer that is in the wrong address space results in a runtime error.
This error is hidden by default but can be enabled with the `-kk` flag:

```
stdin:1:9-12: WARNING: Failed to probe_read_user: Bad address (-14)
BEGIN { @=*uptr(kaddr("do_poweroff")) }
        ~~~
```

bpftrace tries to automatically set the correct address space for a pointer based on the probe type, but might fail in cases where it is unclear.
The address space can be changed with the [kptrs](#kptr) and [uptr](#functios-uptr) functions.

### BTF Support

If the kernel version has BTF support, kernel types are automatically available and there is no need to include additional headers to use them.
It is not recommended to mix definitions from multiple sources (ie. BTF and header files).
If your program mixes definitions, bpftrace will do its best but can easily get confused due to redefinition conflicts.
Prefer to exclusively use BTF as it can never get out of sync on a running system. BTF is also less susceptible to parsing failures (C is constantly evolving).
Almost all current linux deployments will support BTF.

To allow users to detect this situation in scripts, the preprocessor macro `BPFTRACE_HAVE_BTF` is defined if BTF is detected.
See `tools/` for examples of its usage.

Requirements for using BTF for vmlinux:

* Linux 4.18+ with CONFIG_DEBUG_INFO_BTF=y
  * Building requires dwarves with pahole v1.13+
* bpftrace v0.9.3+ with BTF support (built with libbpf v0.0.4+)

Additional requirements for using BTF for kernel modules:

* Linux 5.11+ with CONFIG_DEBUG_INFO_BTF_MODULES=y
  * Building requires dwarves with pahole v1.19+

See kernel documentation for more information on BTF.

### Clang Environment Variables

bpftrace parses header files using libclang, the C interface to Clang.
Thus environment variables affecting the clang toolchain can be used.
For example, if header files are included from a non-default directory, the `CPATH` or `C_INCLUDE_PATH` environment variables can be set to allow clang to locate the files.
See clang documentation for more information on these environment variables and their usage.

### Complex Tools

bpftrace can be used to create some powerful one-liners and some simple tools.
For complex tools, which may involve command line options, positional parameters, argument processing, and customized output, consider switching to bcc.
bcc provides Python (and other) front-ends, enabling usage of all the other Python libraries (including argparse), as well as a direct control of the kernel BPF program.
The down side is that bcc is much more verbose and laborious to program.
Together, bpftrace and bcc are complimentary.

An expected development path would be exploration with bpftrace one-liners, then and ad hoc scripting with bpftrace, then finally, when needed, advanced tooling with bcc.

As an example of bpftrace vs bcc differences, the bpftrace xfsdist.bt tool also exists in bcc as xfsdist.py. Both measure the same functions and produce the same summary of information.
However, the bcc version supports various arguments:

```
# ./xfsdist.py -h
usage: xfsdist.py [-h] [-T] [-m] [-p PID] [interval] [count]

Summarize XFS operation latency

positional arguments:
  interval            output interval, in seconds
  count               number of outputs

optional arguments:
  -h, --help          show this help message and exit
  -T, --notimestamp   don't include timestamp on interval output
  -m, --milliseconds  output in milliseconds
  -p PID, --pid PID   trace this PID only

examples:
    ./xfsdist            # show operation latency as a histogram
    ./xfsdist -p 181     # trace PID 181 only
    ./xfsdist 1 10       # print 1 second summaries, 10 times
    ./xfsdist -m 5       # 5s summaries, milliseconds
```

The bcc version is 131 lines of code. The bpftrace version is 22.

### Errors

1. Looks like the BPF stack limit of 512 bytes is exceeded BPF programs that operate on many data items may hit this limit.
There are a number of things you can try to stay within the limit:
   1. Find ways to reduce the size of the data used in the program. Eg, avoid strings if they are unnecessary: use pid instead of comm. Use fewer map keys.
   2. Split your program over multiple probes.
   3. Check the status of the BPF stack limit in Linux (it may be increased in the future, maybe as a tuneable).
   4. (advanced): Run -d and examine the LLVM IR, and look for ways to optimize src/ast/codegen_llvm.cpp.
2. Kernel headers not found
bpftrace requires kernel headers for certain features, which are searched for by default in: `/lib/modules/$(uname -r)`.
The default search directory can be overridden using the environment variable BPFTRACE_KERNEL_SOURCE and also BPFTRACE_KERNEL_BUILD if it is out-of-tree Linux kernel build.

### Invocation Mode

There are three invocation modes for bpftrace built-in functions.

|     |     |     |
| --- | --- | --- |
| Mode | Description | Example functions |
| Synchronous | The value/effect of the built-in function is determined/handled right away by the bpf program in the kernel space. | `reg(), str(), ntop()` |
| Asynchronous | The value/effect of the built-in function is determined/handled later by the bpftrace process in the user space. | `printf(), clear(), exit()` |
| Compile-time | The value of the built-in function is determined before bpf programs are running. | `kaddr(), cgroupid(), offsetof()` |

While BPF in the kernel can do a lot there are still things that can only be done from user space, like the outputting (printing) of data.
The way bpftrace handles this is by sending events from the BPF program which user-space will pick up some time in the future (usually in milliseconds).
Operations that happen in the kernel are 'synchronous' ('sync') and those that are handled in user space are 'asynchronous' ('async')

The asynchronous behaviour can lead to some unexpected behavior as updates can happen before user space had time to process the event. The following situations may occur:

* event loss: when using printf(), the amount of data printed may be less than the actual number of events generated by the kernel during BPF program’s execution.
* delayed exit: when using the exit() to terminate the program, bpftrace needs to handle the exit signal asynchronously causing the BPF program may continue to run for some additional time.

One example is updating a map value in a tight loop:

```
BEGIN {
    @=0;
    unroll(10) {
      print(@);
      @++;
    }
    exit()
}
```

Maps are printed by reference not by value and as the value gets updated right after the print user-space will likely only see the final value once it processes the event:

```
@: 10
@: 10
@: 10
@: 10
@: 10
@: 10
@: 10
@: 10
@: 10
@: 10
```

Therefore, when you need precise event statistics, it is recommended to use synchronous functions (e.g. count() and hist()) to ensure more reliable and accurate results.

### Map Printing

By default when a bpftrace program exits it will print all maps to stdout.
If you don’t want this, you can either override the `print_maps_on_exit` configuration option or you can specify an `END` probe and `clear` the maps you don’t want printed.

For example, these two scripts are equivalent and will print nothing on exit:
```
config = {
  print_maps_on_exit=0
}

BEGIN {
  @a = 1;
  @b[1] = 1;
}
```

```
BEGIN {
  @a = 1;
  @b[1] = 1;
}

END {
  clear(@a);
  clear(@b);
}
```

### Systemd support

* **To run bpftrace in the background using systemd**
```
# systemd-run --unit=bpftrace --service-type=notify bpftrace -e 'kprobe:do_nanosleep { printf("%d sleeping\n", pid); }'
```

In the above example, systemd-run will not finish until bpftrace has attached
its probes, so you can be sure that all following commands will be traced. To
stop tracing, run `systemctl stop bpftrace`.

To debug early boot issues, bpftrace can be invoked via a systemd service
ordered before the service that needs to be traced. A basic unit file to run
bpftrace before another service looks as follows::
```
[Unit]
Before=service-i-want-to-trace.service

[Service]
Type=notify
ExecStart=bpftrace -e 'kprobe:do_nanosleep { printf("%d sleeping\n", pid); }'
```

Similarly to the systemd-run example, the service to be traced will not start
until bpftrace started by the systemd unit has attached its probes.

### PER_CPU types

For bpftrace PER_CPU types (search this document for "PER_CPU"), you may coerce
(and thus force a more expensive synchronous read) the type to an integer using
a cast or by doing a comparison. This is useful for when you need an integer
during comparisons, `printf()`, or other.

For example:

```
BEGIN {
  @c = count();
  @s = sum(3);
  @s = sum(9);

  if (@s == 12) {                             // Coerces @s
    printf("%d %d\n", (int64)@c, (int64)@s);  // Coerces @c and @s and prints "1 12"
  }
}
```