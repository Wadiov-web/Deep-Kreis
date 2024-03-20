const express = require('express')
const router = express.Router()
const auth = require('./auth')
const dbController = require('./db.controller')
const multer = require('multer')
require('dotenv').config()


const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, __dirname + '../../uploads')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    } else {
        cb(null, false)
    }
}
const upload = multer({
    storage,
    limits: { fileSize: 1024 *  1024 * 5},
    fileFilter
})
const handleFile = upload.single('image')


router.get('/', isAuth, (req, res) => {
    dbController.getPostsChunk(0)
    .then(posts => {
        dbController.getWarriorById(req.session.warriorID)
        .then(warrior => {
            res.render('home', {posts, warrior})
        }).catch(err => console.log(err))  
    }).catch(err => console.log(err))  
})


router.get('/get-posts/:id', isAuth, (req, res) => {
    dbController.getPostsChunk(req.params.id)
    .then(posts => {
        setTimeout(() => res.json({posts}), 1*1*2000)
        
    }).catch(err => console.log(err))  
})


router.get('/get-post-likes/:id', isAuth, (req, res) => {
    dbController.getLikesByPostId(req.params.id)
    .then(result => {
        res.json({count: result.count})
    }).catch(err => console.log(err))  
})


router.get('/comments/:id', isAuth, (req, res) => {
    dbController.getPostComments(req.params.id)
    .then(result => {
        res.json(result)
    }).catch(err => console.log(err))
})


router.post('/comments/:id', isAuth, (req, res) => {
    dbController.getWarriorById(req.session.warriorID)
    .then(warrior => {
        const comment = {cont: req.body.comment, post_id: req.params.id, commenter_id: warrior.id, commenter_name: warrior.username, commenter_pic: warrior.picture}
        dbController.insertCommentToPost(comment)
        .then(result => {
            res.json({msg: 'success comment upload'})
        }).catch(err => console.log(err))  

    }).catch(err => console.log(err))
})


router.post('/likes/:id', isAuth, async (req, res) => {
    const postIsLiked = await dbController.checkUserLikedPost(req.session.warriorID, req.params.id)
    if(postIsLiked){
        // remove like from post
        //console.log('remove like from post')
        await dbController.removeLikeFromPost(req.session.warriorID, req.params.id)
        res.json({msg: 'removed'})
    } else {
        // add like to post
        //console.log('add like to post')
        await dbController.addLikeToPost(req.session.warriorID, req.params.id)
        res.json({msg: 'added'})
    }
})

router.get('/chat', isAuth, (req, res) => {
    dbController.getWarriorById(req.session.warriorID)
    .then(warrior => {
        dbController.getWarriors(req.session.warriorID)
        .then(warriors => {
            res.render('chat', {warrior, warriors})
        }).catch(err => console.log(err))  
    }).catch(err => console.log(err))  
})


router.post('/get-messages', isAuth, (req, res) => {
    const {warriorId, fellowId} = req.body
    dbController.getMessages(warriorId, fellowId)
    .then(result => {
        res.json(result)
    }).catch(err => console.log(err)) 
})


router.get('/post', isAuth, (req, res) => {
    res.render('post', {msg: ''})
})


router.post('/post', isAuth, handleFile, (req, res) => {
    if(req.body.texte){
        dbController.getWarriorById(req.session.warriorID)
        .then(warrior => {
            if(req.file){
                const post = { texte: req.body.texte, image: req.file.filename, warrior_name: warrior.username, warrior_pic: warrior.picture }
                dbController.insertBothPost(post, req.session.warriorID)
                .then(result => {
                    res.render('post', { msg: 'Post uploaded successfully' })
                }).catch(err => console.log(err))
            } else {
                const post = { texte: req.body.texte, warrior_name: warrior.username, warrior_pic: warrior.picture }
                dbController.insertTextPost(post, req.session.warriorID)
                .then(result => {
                    res.render('post', { msg: 'Post uploaded successfully' })
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))
        
    } else{
        res.render('post', { msg: 'Please write something on your post' })
    }
})


router.post('/update-pic', isAuth, handleFile, (req, res) => {
    dbController.getWarriorById(req.session.warriorID)
    .then(warrior => {
        if(req.file){
            dbController.updateProfilePic(req.file.filename, req.session.warriorID)
            .then(result => {
                res.render('profile', {name: warrior.username, pic: warrior.picture, msg: 'Profile picture is updated'})
            }).catch(err => console.log(err))
        } else {
            res.render('profile', {name: warrior.username, pic: warrior.picture, msg: 'Please upload picture'})
        }
    }).catch(err => console.log(err))
})


router.get('/profile', isAuth, (req, res) => {
    dbController.getWarriorById(req.session.warriorID)
    .then(warrior => {
        console.log(warrior)
        res.render('profile', {name: warrior.username, pic: warrior.picture, msg: ''})
    })
})


const clientID = process.env.CLIENTID
const redirectURI = process.env.REDIRECTURI
const scope = process.env.SCOPE
const URL = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${redirectURI}&client_id=${clientID}&access_type=offline&response_type=code&prompt=consent&scope=${scope}`;


router.get('/signin', notAuth, (req, res) => {
    res.render('signin', {URL})
})


router.get('/auth/google/callback', notAuth, async (req,res) => {
	// Back chanel request
	try{
		const response = await auth.codeTokenExchange(req);
        // console.log(response)
		if(response.error){
			console.log('user canceled the access')
			res.redirect('/signin')
		} else {
			const accessToken = response.access_token;
			const idToken = response.id_token;
			try{
				const googleUser = await auth.retrieveUserData(accessToken, idToken)
				// Successful login/signup
                const warrior = await dbController.getWarriorByGoogleId(googleUser.sub)
                if(warrior) {
                    console.log('warrior exists')
                    req.session.warriorID = warrior.id
                    console.log('already warrior logged in')
                    console.log(req.session)
                    res.redirect('/');
                } else {
                    console.log('warrior does not exists')
                    await dbController.addWarriorToDB(googleUser.sub, googleUser.name, googleUser.email, googleUser.picture)

                    const newWarrior = await dbController.getWarriorByGoogleId(googleUser.sub)
                    console.log(newWarrior)
                    req.session.warriorID = newWarrior.id
                    console.log('New warrior logged in')
                    console.log(req.session)
                    res.redirect('/');
                }    
			} catch(error){
				console.log('Error while requesting google user data with access token' + '\n' + error)
				res.send('<h1>Failure login</h1>');
			}
		}
	} catch(error){
		console.log('Error while exchanging code with access token' + '\n' + error)
		res.send('<h1>Failure login</h1>');
	}
});


router.get('/app/privacy-policy', (req, res) => {
	res.render('privacy-policy');
});                                        


router.get('/app/terms-of-service', (req, res) => {
	res.render('terms-of-service');
});        


function isAuth(req, res, next){
    if(req.session.warriorID) {
        return next()
    } else {
        return res.redirect('/signin')
    }
}
function notAuth(req, res, next){
    if(req.session.warriorID) {
        return res.redirect('/')
    } else {
        return next()
    }
}


router.post('/signout', isAuth, (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.redirect('/')
        } 
        return res.redirect('/signin')
    })
});     


module.exports = router