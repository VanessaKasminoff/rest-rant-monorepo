const router = require('express').Router()
const db = require("../models")
const jwt = require('json-web-token')

const { Place, Comment, User } = db

router.post('/', async (req, res) => {
    if (req.currentUser?.role !== 'admin') {
        return res.status(403).json({message: 'You are not allowed to add a place'})
    }

    if (!req.body.pic) {
        req.body.pic = 'http://placekitten.com/400/400'
    }
    if (!req.body.city) {
        req.body.city = 'Anytown'
    }
    if (!req.body.state) {
        req.body.state = 'USA'
    }
    const place = await Place.create(req.body)
    res.json(place)
})


router.get('/', async (req, res) => {
    const places = await Place.findAll()
    res.json(places)
})


router.get('/:placeId', async (req, res) => {
    let placeId = Number(req.params.placeId)
    if (isNaN(placeId)) {
        res.status(404).json({ message: `Invalid id "${placeId}"` })
    } else {
        const place = await Place.findOne({
            where: { placeId: placeId },
            include: {
                association: 'comments',
                include: 'author'
            }
        })
        if (!place) {
            res.status(404).json({ message: `Could not find place with id "${placeId}"` })
        } else {
            res.json(place)
        }
    }
})

router.put('/:placeId', async (req, res) => {
    if (req.currentUser?.role !== 'admin') {
        return res.status(403).json({message: 'You are not allowed to edit a place'})
    }

    let placeId = Number(req.params.placeId)
    if (isNaN(placeId)) {
        res.status(404).json({ message: `Invalid id "${placeId}"` })
    } else {
        const place = await Place.findOne({
            where: { placeId: placeId },
        })
        if (!place) {
            res.status(404).json({ message: `Could not find place with id "${placeId}"` })
        } else {
            Object.assign(place, req.body)
            await place.save()
            res.json(place)
        }
    }
})

router.delete('/:placeId', async (req, res) => {
    if (req.currentUser?.role !== 'admin') {
        return res.status(403).json({message: 'You are not allowed to delete a place'})
    }

    let placeId = Number(req.params.placeId)
    if (isNaN(placeId)) {
        res.status(404).json({ message: `Invalid id "${placeId}"` })
    } else {
        const place = await Place.findOne({
            where: {
                placeId: placeId
            }
        })
        if (!place) {
            res.status(404).json({ message: `Could not find place with id "${placeId}"` })
        } else {
            await place.destroy()
            res.json(place)
        }
    }
})

router.post('/:placeId/comments', async (req, res) => {
    const placeId = Number(req.params.placeId)

    req.body.rant = req.body.rant ? true : false

    const place = await Place.findOne({
        where: { placeId: placeId }
    })

    if (!place) {
        res.status(404).json({ message: `Could not find place with id "${placeId}"` })
    }

    if (!req.currentUser) {
        return res.status(404).json({message: 'You must be logged in to leave a review.'})
    }

    // let user;
    // try {
    //     //split the auth header into ['Bearer', 'token]
    //     const [authenticationMethod, token] = req.headers.authorization.split(' ')

    //     //only handle 'Bearer' auth for now
    //     if (authenticationMethod == 'Bearer') {
    //         //decode JWT
    //         const result = await jwt.decode(process.env.JWT_SECRET, token)

    //         //get the logged in user's id from the payload
    //         const {id} = result.value

    //         //find the user object using their id
    //         user = await User.findOne({
    //             where: {
    //                 userId: id
    //             }
    //         })
    //     }
    // } catch {
    //     res.json(null)
    // }
    
    // if (!user) {
    //     return res.status(404).json({
    //         message: `You must be logged in to leave a review.`
    //     })
    // }

    // const author = await User.findOne({
    //     where: { userId: req.body.authorId }
    // })

    // if (!author) {
    //     res.status(404).json({ message: `Could not find author with id "${req.body.authorId}"` })
    // }


    const comment = await Comment.create({
        ...req.body,
        authorId: req.currentUser.userId,
        placeId: placeId
    })
   
    res.send({
        ...comment.toJSON(),
        author: req.currentUser
    })
})

router.delete('/:placeId/comments/:commentId', async (req, res) => {
    let placeId = Number(req.params.placeId)
    let commentId = Number(req.params.commentId)

    if (isNaN(placeId)) {
        res.status(404).json({ message: `Invalid id "${placeId}"` })
    } else if (isNaN(commentId)) {
        res.status(404).json({ message: `Invalid id "${commentId}"` })
    } else {
        const comment = await Comment.findOne({
            where: { commentId: commentId, placeId: placeId }
        })
        if (!comment) {
            res.status(404).json({ message: `Could not find comment with id "${commentId}" for place with id "${placeId}"` })
        } else if (comment.authorId !== req.currentUser?.userId) {
            res.status(403).json({
                message: `You do not have permission to delete comment ${comment.commentId}`
            })
        } else {
            await comment.destroy()
            res.json(comment)
        }
    }
})


module.exports = router