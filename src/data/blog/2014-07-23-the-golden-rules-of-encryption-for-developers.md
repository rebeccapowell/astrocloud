---
id: 2574
title: 'The golden rules of encryption for developers'
pubDatetime: 2014-07-23T23:51:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=2574'
slug: 2014-07-23-the-golden-rules-of-encryption-for-developers
description: Essential guidelines for developers on implementing encryption, highlighting common pitfalls and recommending best practices for secure cryptographic methods and algorithms.s for developers on implementing encryption, highlighting common pitfalls and recommending best practices for secure cryptographic methods and algorithms.
categories:
    - work
tags:
    - cryptography
    - ecb
    - encryption
    - featured
    - hmac
    - howto
    - md5
    - pkrng
    - rsa
    - sha1
    - sha2
    - tls
---

It is easier to provide the list of things that are worth worrying about than it is to list the things that are safe. There are a lot of as-yet unbroken ciphers and constructions. So, here are the things to avoid:de the list of things that are worth worrying about than it is to list the things that are safe. There are a lot of as-yet unbroken ciphers and constructions. So, here are the things to avoid:

* Block ciphers in the default mode ("ECB"). default mode ("ECB").
* The Dual_EC random number generator, which virtually nobody uses anyways. You weren't going to accidentally end up using it. Or, for that matter, any other PKRNG (random numbers produced by public key algorithms).* The Dual_EC random number generator, which virtually nobody uses anyways. You weren't going to accidentally end up using it. Or, for that matter, any other PKRNG (random numbers produced by public key algorithms).
* RSA with 1024 bit moduli (or below); RSA-2048 is your starting point. Conventional DH at similar key sizes will be an issue too, but there's a "means/motive/opportunity" issue for RSA-1024 given its prevalence.oduli (or below); RSA-2048 is your starting point. Conventional DH at similar key sizes will be an issue too, but there's a "means/motive/opportunity" issue for RSA-1024 given its prevalence.
* MD4, MD5, and SHA1 aren't backdoored, but are broken or weak. But: all three are survivable in HMAC (don't use them, though). SHA2 is your best all-around hashing bet right now.ken or weak. But: all three are survivable in HMAC (don't use them, though). SHA2 is your best all-around hashing bet right now.
* The NIST P- curves. There's no evidence to suggest they're backdoored, but (a) the rationale behind their generation is questionable and (b) they have other annoying properties.There's no evidence to suggest they're backdoored, but (a) the rationale behind their generation is questionable and (b) they have other annoying properties.

So far as I can tell, you are now fully briefed on the "distrusted" crypto. you are now fully briefed on the "distrusted" crypto.

Don't build your own crypto. Use PGP for data at rest, TLS for data in motion, and NaCl for the rare in-between cases.rypto. Use PGP for data at rest, TLS for data in motion, and NaCl for the rare in-between cases.

Source @tptacek: [https://news.ycombinator.com/user?id=tptacek](https://news.ycombinator.com/user?id=tptacek)ps://news.ycombinator.com/user?id=tptacek](https://news.ycombinator.com/user?id=tptacek)

### Update (2024)
Ten years on, many of the original recommendations still hold true. However, there have been advancements and changes in the field of cryptography:Ten years on, many of the original recommendations still hold true. However, there have been advancements and changes in the field of cryptography:

* **RSA-2048**: While still widely used, RSA-2048 is being gradually replaced by stronger algorithms like RSA-3072 and RSA-4096 for higher security.
* **SHA2**: SHA2 remains a strong choice for hashing, but SHA3 has been introduced as a more secure alternative and is gaining adoption.ns a strong choice for hashing, but SHA3 has been introduced as a more secure alternative and is gaining adoption.
* **TLS**: TLS 1.2 is still in use, but TLS 1.3 has become the standard, offering improved security and performance.* * **PGP**: PGP is still relevant for data at rest, but newer tools like age and minisign are emerging as simpler and more secure alternatives.ll relevant for data at rest, but newer tools like age and minisign are emerging as simpler and more secure alternatives.
* **NaCl**: NaCl (libsodium) continues to be a robust choice for cryptographic operations, with ongoing updates and improvements.

Overall, the principles of avoiding weak algorithms and not building custom cryptographic solutions remain crucial. Developers should stay informed about the latest cryptographic standards and best practices to ensure the security of their applications.