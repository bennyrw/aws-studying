Fully managed NoSQL database.

# Concepts

A `Table` contain multiple items. An `Item` contains multiple attributes. An `Attribute` is a single field value.

**Primary key**
* Simple primary key (use an item attribute as the `partition key`)
  * Partition key must be unique
* Composite primary key (use two item attrbitues, one as `partition key` and one as `sort key`)
  * Combination of partition key and sort key must be unique.
  * Partition key determines physical partition space storing the items.

**Capacity**
* Write Capacity Units (`WCUs`) - 1kb at a time, per second
* Read Capacity Units (`RCUs`) - 4kb at a time, 1 strongly consistent read or 2 eventually consistent reads


# Reading data

**GetItem** - Get an item matching a primary key. Highly efficient.

**Queries** - Find items based on primary key, can return subset based on sort key. Can then use filter based on other attributes.

**Scan** - Returns everything, very inefficient. Avoid when possible.


# Gotchas

* Default it to use eventual consistency. You can explicitly specify using __strongly consistent reads__ instead in API calls and other things using DynamoDB. Note that this will currently cost 2x eventual consistency.