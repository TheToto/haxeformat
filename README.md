# haxeformat

Fork of `qwkpkt`, with some fix and extra features to follow exactly the haxe serialization format (haxe enums, dates format, strings base64).

# Installation
haxeformat is on npm, so it can be installed with *yarn add haxeformat* or *npm install haxeformat*. 

# Options
```typescript
let S = new Serializer();
let U = new Unserializer();

// Serialize enums with their index instead their name.
S.useEnumIndex = false;

// Allow to unserialize class or enums that are not registred using
// Unserializer.registerSerializableEnum()
// Unserializer.registerSerializableClass()
U.allowUnregistered = false;

// Add a `___type` property to some objects,
// to keep haxe type information (like Array vs List).
// This allow to Unserialize, then Serialize, and keep the sames types
U.addTypeHints = true;
```

# Formats
## Basic type encoding
Almost anything can be serialized, simply create a Serializer instance, and start adding things.
Once you're done, call .toString(). The resulting string can then be passed to an Unserializer
instance, and items are unserialized in the order they were put in.
```typescript
let S = new Serializer();
S.serialize(123);
S.serialize(['my','string','array']);
S.serialize(false);
let result = S.toString();
console.log(result);
let U = new Unserializer();
let num : number = U.unserialize();
let arr : Array<String> = U.unserialize();
let bol : boolean = U.unserialize();
```

## Class encoding
Entire class instances can be serialized, simply by passing an instance of the class to the
serializer
```typescript
let a = new Apple("green");
let S = new Serializer();
S.serialize(a);
let res = S.toString();
// yes, toString can be called multiple times, even before
// full encoding is complete.
console.log(S.toString());
let U = new Unserializer(res);
let apple2 : Apple = U.unserialize(); 
```