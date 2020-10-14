# qwkpkt

*qwkpkt* is an object serialization and packet framework for network communications and storage.
It is a fast library for serializing messages for things like websockets.

qwkpkt is able to encode objects as well as full javascript classes, but is most efficient when 
using the Packet framework that you can see in the tests directory.

# Formats
## Class encoding
## type encoding
## Custom encoding
By adding two functions, *_qwkpktEncode* and *_qwkpktDecode* to any class, when an instance of 
that class is passed to qwkpkt, the encode method will be called which allows the class
to self-encode. Upon deserialization, the *qwkpktDecode* method is called **on an empty instance**.
This means that the constructor has not been called, so you must ensure that any initialization is
done inside this method. See /tests/packet/PacketMoveCustom.ts

# The tests
This suite runs a number of tests, showing the size and speed comparisons between using qwkpkt
and the popular library [msgpack](https://msgpack.org/).
```
yarn speed-test
```
or 
```
npm run speed-test
```

#The results
Generally the slowest, but certainly the most convenient, is encoding classes. In the test results
below, thos are marked as *qwkclas*

For both the *qwkobj* and *msgpack* encoding, anonymous objects are created from the packet classes
then encoded/decoded.

The fastest and smallest verion overall is using the *qwkpkt* approach. This is not a separate library,
but a set of typescript classes in /test/packet that you can implement in your code.

A packet with two integer values and two floating point values:
```
PacketMotion Encoding 1000000 times
===================================
qwkclas : 2.441s        1
msgpack : 2.007s        1.21 x faster
qwkobj  : 1.794s        1.36 x faster
qwkpkt  : 0.265s        9.21 x faster

PacketMotion Decoding 1000000 times
===================================
qwkclas : 3.532s        1
msgpack : 1.400s        2.52 x faster
qwkobj  : 0.896s        3.94 x faster
qwkpkt  : 0.571s        6.18 x faster

PacketMotion Encoded Packet Length
==================================
qwkobj  : 99 bytes      1
qwkclas : 88 bytes      1.12 x smaller
msgpack : 55 bytes      1.8 x smaller
qwkpkt  : 18 bytes      5.5 x smaller
```

A packet of text:
```
PacketChat Encoding 1000000 times
=================================
qwkclas : 2.091s        1
msgpack : 1.649s        1.26 x faster
qwkobj  : 1.332s        1.56 x faster
qwkpkt  : 0.510s        4.1 x faster

PacketChat Decoding 1000000 times
=================================
qwkclas : 2.845s        1
msgpack : 1.100s        2.58 x faster
qwkpkt  : 0.891s        3.19 x faster
qwkobj  : 0.885s        3.21 x faster

PacketChat Encoded Packet Length
================================
qwkclas : 89 bytes      1
qwkobj  : 86 bytes      1.03 x smaller
qwkpkt  : 48 bytes      1.85 x smaller
msgpack : 48 bytes      1.85 x smaller
```

#Using custom encoding with code compressors
Many javascript code compressors do name mangling, which will certainly cause issues with the Custom
type of serialization. In order to prevent this issue, make sure your minifier is configured to 
ignore the fields *_qwkpktEncode* and *_qwkpktDecode*. For uglifyjs, this should look something like
```
uglifyjs ... -m reserved=['_qwkpktEncode','_qwkpktDecode']
```

#Haxe Compatible
This work is largely based on the [Haxe](https://www.haxe.org) serialization format, and is mostly 
compatible. Haxe Enums are not implemented, and some minor changes to use are required. 