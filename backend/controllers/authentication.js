const router = require('express').Router()
const db = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('json-web-token')

const {User} = db

router.post('/', async (req, res) => {
    let user = await User.findOne({
        where: {email: req.body.email}
    })

    if(!user || !await bcrypt.compare(req.body.password, user.passwordDigest)) {
        res.status(404).json({message: `Could not find a user with the provided username and password`})
    } else {
        const result = await jwt.encode(process.env.JWT_SECRET, {id: user.userId})
        res.json({user: user, token: result.value})
    }
    console.log(user)
})

router.get('/profile', async (req, res) => {
    try {
        //split the auth header into ['Bearer', 'token]
        const [authenticationMethod, token] = req.headers.authorization.split(' ')

        //only handle 'Bearer' auth for now
        if (authenticationMethod == 'Bearer') {
            //decode JWT
            const result = await jwt.decode(process.env.JWT_SECRET, token)

            //get the logged in user's id from the payload
            const {id} = result.value

            //find the user object using their id
            let user = await User.findOne({
                where: {
                    userId: id
                }
            })
            res.json(user)
        }
    } catch {
        res.json(null)
    }
})

module.exports = router