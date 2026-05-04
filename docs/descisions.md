Decision: Validation in middleware, not controllers
Alternatives considered: Validating inside each controller function
Why: Controllers stay focused on business logic. Validation is a cross-cutting concern — putting it in reusable middleware means adding a new route is just validate(SomeSchema), one line. Controllers receive data they can trust.