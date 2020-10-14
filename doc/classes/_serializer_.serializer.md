**[qwkpkt - v0.5.0](../README.md)**

> [Globals](../globals.md) / ["Serializer"](../modules/_serializer_.md) / Serializer

# Class: Serializer

## Hierarchy

* **Serializer**

## Index

### Constructors

* [constructor](_serializer_.serializer.md#constructor)

### Properties

* [useCache](_serializer_.serializer.md#usecache)
* [USE\_CACHE](_serializer_.serializer.md#use_cache)

### Methods

* [serialize](_serializer_.serializer.md#serialize)
* [toBuffer](_serializer_.serializer.md#tobuffer)
* [toString](_serializer_.serializer.md#tostring)
* [run](_serializer_.serializer.md#run)

## Constructors

### constructor

\+ **new Serializer**(): [Serializer](_serializer_.serializer.md)

*Defined in [Serializer.ts:49](https://github.com/Madrok/pktstorm/blob/19b5823/src/Serializer.ts#L49)*

**Returns:** [Serializer](_serializer_.serializer.md)

## Properties

### useCache

•  **useCache**: boolean = Serializer.USE\_CACHE

*Defined in [Serializer.ts:49](https://github.com/Madrok/pktstorm/blob/19b5823/src/Serializer.ts#L49)*

The individual cache setting for 'this' Serializer instance.
See [USE_CACHE](_serializer_.serializer.md#use_cache) for a complete description

___

### USE\_CACHE

▪ `Static` **USE\_CACHE**: boolean = false

*Defined in [Serializer.ts:13](https://github.com/Madrok/pktstorm/blob/19b5823/src/Serializer.ts#L13)*

If the values you are serializing can contain circular references or
objects repetitions, you should set `USE_CACHE` to true to prevent
infinite loops.

This may also reduce the size of serialization Strings at the expense of
performance.

This value can be changed for individual instances of `Serializer` by
setting their `useCache` field.

## Methods

### serialize

▸ **serialize**(`v`: any): void

*Defined in [Serializer.ts:76](https://github.com/Madrok/pktstorm/blob/19b5823/src/Serializer.ts#L76)*

Once you have created a serializer, just keep serializing things
by calling this method. At any point, you can call [toString](_serializer_.serializer.md#tostring)
to get the current encode buffer.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`v` | any | Any value to serialize  |

**Returns:** void

___

### toBuffer

▸ **toBuffer**(): Buffer

*Defined in [Serializer.ts:66](https://github.com/Madrok/pktstorm/blob/19b5823/src/Serializer.ts#L66)*

Returns the serialized data as a byte buffer.

**`see`** toString

**Returns:** Buffer

___

### toString

▸ **toString**(): string

*Defined in [Serializer.ts:58](https://github.com/Madrok/pktstorm/blob/19b5823/src/Serializer.ts#L58)*

Return the String representation of this Serializer. This may
be called after any call to [serialize](_serializer_.serializer.md#serialize) without affecting
subsequent calls to [serialize](_serializer_.serializer.md#serialize)

**Returns:** string

___

### run

▸ `Static`**run**(`v`: any): string

*Defined in [Serializer.ts:34](https://github.com/Madrok/pktstorm/blob/19b5823/src/Serializer.ts#L34)*

Serializes `v` and returns the String representation.

This is a convenience function for creating a new instance of
Serializer, serialize `v` into it and obtain the result through a call
to `toString()`.

#### Parameters:

Name | Type |
------ | ------ |
`v` | any |

**Returns:** string
