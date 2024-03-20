const pool = require('../db/psql.connect')

async function getWarriorByGoogleId(googleId){
    const result = await pool.query('SELECT * FROM warrior WHERE google_id = $1', [googleId])
    return result.rows[0]
}

async function addWarriorToDB(sub, name, email, picture){
    await pool.query('INSERT INTO warrior (google_id, username, email, picture) VALUES ($1, $2 , $3, $4)', 
    [sub, name, email, picture])
}

async function getWarriorById(warriorId){
    const result = await pool.query('SELECT * FROM warrior WHERE id = $1', [warriorId])
    return result.rows[0]
}

async function insertTextPost(post, warriorId){
    await pool.query('INSERT INTO post (texte, warrior_id, warrior_name, warrior_pic) VALUES ($1, $2, $3, $4)', 
    [post.texte, warriorId, post.warrior_name, post.warrior_pic])
}

async function insertBothPost(post, warriorId){
    await pool.query('INSERT INTO post (texte, post_pic, warrior_id, warrior_name, warrior_pic) VALUES ($1, $2, $3, $4, $5)', 
    [post.texte, post.image, warriorId, post.warrior_name, post.warrior_pic])
}

async function getWarriorsPosts(){
    const result = await pool.query('SELECT * FROM post')
    return result.rows
}

async function insertCommentToPost(cmt){
    await pool.query('INSERT INTO comment (cont, commenter_id, commenter_name, commenter_pic, post_id) VALUES ($1, $2, $3, $4, $5)', 
    [cmt.cont, cmt.commenter_id, cmt.commenter_name, cmt.commenter_pic, cmt.post_id])
}

async function getPostComments(postId){
    const result = await pool.query('SELECT * FROM comment WHERE post_id = $1', [postId])
    return result.rows
}

async function checkUserLikedPost(warriorId, postId){
    const result = await pool.query('SELECT * FROM likes WHERE warrior_id = $1 AND post_id = $2', 
    [warriorId, postId])
    return result.rows[0]
}

async function addLikeToPost(warriorId, postId){
    await pool.query('INSERT INTO likes (warrior_id, post_id) VALUES ($1, $2)', 
    [warriorId, postId])
}

async function removeLikeFromPost(warriorId, postId){
    await pool.query('DELETE FROM likes WHERE warrior_id = $1 AND post_id = $2', 
    [warriorId, postId])
}

async function getLikesByPostId(postId){
    const result = await pool.query('SELECT count(*) FROM likes WHERE post_id = $1;', 
    [postId])
    return result.rows[0]
}

async function getPostsChunk(startNum){
    const result = await pool.query('SELECT * FROM post ORDER BY created_at DESC LIMIT 10 OFFSET $1;', [startNum])
    return result.rows
}

async function updateProfilePic(picName, warriorId){
    await pool.query('UPDATE warrior SET picture = $1 WHERE id = $2;', 
    [picName, warriorId])
    await pool.query('UPDATE post SET warrior_pic = $1 WHERE warrior_id = $2;', 
    [picName, warriorId])
    await pool.query('UPDATE comment SET commenter_pic = $1 WHERE commenter_id = $2;', 
    [picName, warriorId])
}

async function getWarriors(loggedinId){
    const result = await pool.query('SELECT * FROM warrior WHERE id != $1;', [loggedinId])
    return result.rows
}

async function getMessages(warriorId, fellowId){
    const result = await pool.query('SELECT * FROM chat WHERE user1 = $1 AND user2 = $2 OR user1 = $2 AND user2 = $1;', [warriorId, fellowId])
    return result.rows
}

async function addMessage(msg, fromId, fromId, toId){
    await pool.query('INSERT INTO chat (msg, sent_from, user1, user2) VALUES($1, $2, $3, $4);', 
    [msg, fromId, fromId, toId])
}

module.exports = {
    getWarriorByGoogleId,
    addWarriorToDB,
    getWarriorById,
    insertTextPost,
    insertBothPost,
    getWarriorsPosts,
    insertCommentToPost,
    getPostComments,
    checkUserLikedPost,
    addLikeToPost,
    removeLikeFromPost,
    getLikesByPostId,
    getPostsChunk,
    updateProfilePic,
    getWarriors,
    getMessages,
    addMessage,
}

// SELECT * FROM post ORDER BY RANDOM() LIMIT 5;