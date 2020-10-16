**[qwkpkt - v0.5.0](../README.md)**

> [Globals](../globals.md) / ["Packet"](../modules/_packet_.md) / Packet

# Class: Packet

## Hierarchy

* **Packet**

## Index

### Constructors

* [constructor](_packet_.packet.md#constructor)

### Properties

* [id](_packet_.packet.md#id)

### Methods

* [encode](_packet_.packet.md#encode)
* [test](_packet_.packet.md#test)
* [toJSON](_packet_.packet.md#tojson)
* [toString](_packet_.packet.md#tostring)
* [decode](_packet_.packet.md#decode)
* [register](_packet_.packet.md#register)

## Constructors

### constructor

\+ **new Packet**(`id`: number, `fields`: Array\<string>): [Packet](_packet_.packet.md)

*Defined in [Packet.ts:45](https://github.com/Madrok/pktstorm/blob/f0875b2/src/Packet.ts#L45)*

#### Parameters:

Name | Type |
------ | ------ |
`id` | number |
`fields` | Array\<string> |

**Returns:** [Packet](_packet_.packet.md)

## Properties

### id

• `Readonly` **id**: number

*Defined in [Packet.ts:44](https://github.com/Madrok/pktstorm/blob/f0875b2/src/Packet.ts#L44)*

## Methods

### encode

▸ **encode**(): string

*Defined in [Packet.ts:104](https://github.com/Madrok/pktstorm/blob/f0875b2/src/Packet.ts#L104)*

Serialize this packet.
This method does not have to be overridden by subclasses.

**Returns:** string

Packet serialized

___

### test

▸ **test**(): void

*Defined in [Packet.ts:55](https://github.com/Madrok/pktstorm/blob/f0875b2/src/Packet.ts#L55)*

Test that the fields all exist

**Returns:** void

___

### toJSON

▸ **toJSON**(): string

*Defined in [Packet.ts:88](https://github.com/Madrok/pktstorm/blob/f0875b2/src/Packet.ts#L88)*

Returns a json version of this packet

**Returns:** string

___

### toString

▸ `Abstract`**toString**(): string

*Defined in [Packet.ts:83](https://github.com/Madrok/pktstorm/blob/f0875b2/src/Packet.ts#L83)*

All packets must implement a toString, which is useful for debugging.

**Returns:** string

Arbitray string value representing the packet

___

### decode

▸ `Static`**decode**(`str`: string): [Packet](_packet_.packet.md)

*Defined in [Packet.ts:23](https://github.com/Madrok/pktstorm/blob/f0875b2/src/Packet.ts#L23)*

Calling this method will deserialize a acpket, creating a new instance
of any class that is a subclass of and registered with Packet

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`str` | string | Serialized packet data  |

**Returns:** [Packet](_packet_.packet.md)

___

### register

▸ `Static`**register**(`id`: number, `classRef`: {}): void

*Defined in [Packet.ts:12](https://github.com/Madrok/pktstorm/blob/f0875b2/src/Packet.ts#L12)*

Must be called by all pakect types after the class definition

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`id` | number | The packet id must be unique for each packet class |
`classRef` | {} | the class constructor. Usually just the name of the class  |

**Returns:** void
