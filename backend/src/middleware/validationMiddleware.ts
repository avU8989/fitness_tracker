import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

//higher-order function takes constructor type --> the class we want to validate against
//Generics allows this middleware to work with any kind of class types
//return an express middleware function
//plainToInstance expects an object, so we must ensure that T is always some kind of object
export function validationMiddleware<T extends object>(type: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    //convert request body to class instance, allowing class-validators to run validation decorators on the object
    const dtoObj = await plainToInstance(type, req.body);

    const errors = await validate(dtoObj);

    // if we have errors map errorts to the constaint message
    // sends 400 bad reques, if no errors call next() to continue to next middleware
    if (errors.length > 0) {
      const message = errors
        .map((err) => Object.values(err.constraints || {}))
        .flat();

      res.status(400).json({ message: "Validation failed", errors: message });
      console.log(message);

      return;
    } else {
      next();
    }
  };
}
