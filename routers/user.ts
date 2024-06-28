import Router from "express";
import { UserRecord } from "../records/user.record";
import { CreateUserReq } from "../types";
import { compare } from "bcrypt";
import { ValidationError } from "../utils/error";

export const userRouter = Router()

userRouter

    .post('/login', async (req, res) => {
        const { email, password } = req.body;
        const user = await UserRecord.getOne(email);
        if (!user) {
            res.json({
                answer: 'NOT OK'
            })
        } else {
            const match = await compare(password, user.password);
            console.log(match)
            if (match) {
                res.json({
                    user,
                    answer: 'OK'
                });
            } else {
                res.json({
                    answer: 'NOT OK'
                })
            }
        }
    })

    .post('/reg', async (req, res) => {
        const allUsers = await UserRecord.listAll()
        const newUser = new UserRecord(req.body as CreateUserReq)
        if (allUsers.map((el) => el.email).includes(newUser.email)) {
            res.json({
                answer: `There is already a user account registered with ${newUser.email}, please try again with different email`
            })
        } else {
            await newUser.insert();
            res.json({
                newUser,
                answer: `User ${newUser.name} ${newUser.surname} was added to the list now try to log in`
            })
        }
    })

    .delete('/:id', async (req, res) => {
        const user = await UserRecord.one(req.params.id)

        if (!user) {
            throw new ValidationError('No such user!');
        }

        await user.delete();

        res.end();

    })

    .put('/name/:id', async (req, res) => {
        const user = await UserRecord.one(req.params.id);
        console.log(req.body)
        if (!user) {
            throw new ValidationError('No such user!');
        }

        await user.updateName(req.body)
        res.json({
            answer: `OK`,
            name: req.body.name,
        })
    })

    .put('/email/:id', async (req, res) => {
        const user = await UserRecord.one(req.params.id);
        console.log(req.body)
        if (!user) {
            throw new ValidationError('No such user!');
        }

        const allUsers = await UserRecord.listAll()

        if (allUsers.map((el) => el.email).includes(req.body.email)) {
            res.json({
                answer: `There is already a user account registered with ${req.body.email}, please try again with different email`
            })
        } else {
            await user.updateEmail(req.body)
            res.json({
                answer: `OK`,
                email: req.body.email
            })
        }
    })