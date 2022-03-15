# Avoiding Common Attacks

**1. Integer Overflow and Underflow**

I have implemented a modifier to make sure value sent in transaction is greater than or equal to issuing price when issuing certification to student. 

*modifier enoughPay() {require(msg.value >= pricePerCertification); _;}*

In addition, I have also used the SafeMath library to make sure transaction fails if wrong calculation happens. 

*msg.sender.transfer(msg.value.sub(pricePerCertification));*

**2. Race condition: Reentrancy**

By using the function *msg.sender.transfer* instead of *msg.sender.call.value* when refunding over paid amount I avoid reentrancy possible attack.


I couldn't identify other vulnerabilities such as:
* Transaction-Ordering Dependence (TOD) / Front Running
* Timestamp Dependence
* DoS with (Unexpected) revert
* DoS with Block Gas Limit
