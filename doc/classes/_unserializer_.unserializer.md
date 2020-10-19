**[qwkpkt - v0.6.0](../README.md)**

> [Globals](../globals.md) / ["Unserializer"](../modules/_unserializer_.md) / Unserializer

# Class: Unserializer

## Hierarchy

* **Unserializer**

## Index

### Constructors

* [constructor](_unserializer_.unserializer.md#constructor)

### Properties

* [resolver](_unserializer_.unserializer.md#resolver)
* [DEFAULT\_RESOLVER](_unserializer_.unserializer.md#default_resolver)

### Methods

* [unserialize](_unserializer_.unserializer.md#unserialize)
* [registerSerializableClass](_unserializer_.unserializer.md#registerserializableclass)

## Constructors

### constructor

\+ **new Unserializer**(`s`: string): [Unserializer](_unserializer_.unserializer.md)

*Defined in [Unserializer.ts:59](https://github.com/Madrok/pktstorm/blob/3df6946/src/Unserializer.ts#L59)*

#### Parameters:

Name | Type |
------ | ------ |
`s` | string |

**Returns:** [Unserializer](_unserializer_.unserializer.md)

## Properties

### resolver

•  **resolver**: [TypeResolver](../interfaces/_unserializer_.typeresolver.md)

*Defined in [Unserializer.ts:59](https://github.com/Madrok/pktstorm/blob/3df6946/src/Unserializer.ts#L59)*

The class resolver for the unserializer.
Defaults to {@link UnserializerDEFAULT_RESOLVER}, but
this can be changed for the current instance

___

### DEFAULT\_RESOLVER

▪ `Static` **DEFAULT\_RESOLVER**: [TypeResolver](../interfaces/_unserializer_.typeresolver.md) = Unserializer.DefaultResolver

*Defined in [Unserializer.ts:15](https://github.com/Madrok/pktstorm/blob/3df6946/src/Unserializer.ts#L15)*

## Methods

### unserialize

▸ **unserialize**(): any

*Defined in [Unserializer.ts:137](https://github.com/Madrok/pktstorm/blob/3df6946/src/Unserializer.ts#L137)*

**Returns:** any

___

### registerSerializableClass

▸ `Static`**registerSerializableClass**(`clazz`: {}): void

*Defined in [Unserializer.ts:28](https://github.com/Madrok/pktstorm/blob/3df6946/src/Unserializer.ts#L28)*

For security, classes will not be unserialized unless they
are registered as safe. Before unserializing, be sure to
register every class that could be in the serialized information.
```
class Apple {}
let apple = new Apple();
Unserializer.register(Apple); // note the class name, not the instance
```

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`clazz` | {} | A class, not an instance or the string but the class name  |

**Returns:** void
