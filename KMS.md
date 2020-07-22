# Key Management Service (KMS)

Strictly speaking, this is part of [IAM](IAM.md)

Integrates fully with IAM and other AWS services that use encryption.

> https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html

# Key concepts

KMS generates _Customer Master Keys_ (CMKs). These are **locked to a specific region** and **never leave KMS unencrypted**.

Typical approach is to use a CMK to generate Data Encryption Keys (DEKs), which are then used to encrypt/decrypt data. This is _envelope encryption_.

CMKs are generated on and reside on FIPS 140-2 compliant hardware.

CMKs have a key policy, which by default only the `root` user has access to.

CMKs are made of 1+ backing keys. Supports key rotation.

KMS allows you to manage encryption and decryption without exposing the keys used to do so.

# CLI

```
# create key without alias
aws kms create-key --description ... --region us-east-1

# add alias (aliases are like a shortcut, which can be the same across regions)
aws kms create-alias --target-key-id ... --alias-name ... --region us-east-1

# generate encryption key (make a note of the encrypted/plaintext key details, they won't be shown again! n.b. they're base64 encoded)
aws kms generate-data-key --key-id ... --key-spec AES_256 --region us-east-1

# can then use the key (after decoding from base64) to encrypt data, e.g. with openssl
echo ... | openssl enc -e -aes256 -k fileb://path/to/decoded/plaintext/key

# get plaintext version of encrypted DEK
aws kms decrypt --ciphertext-blob fileb://path/to/decoded/encrypted/key --region us-east-1

# can then decrypt the data, e.g. using openssl
cat encryptedData.txt | openssl enc -d -aes256 -k fileb://path/to/decoded/plaintext/key
```