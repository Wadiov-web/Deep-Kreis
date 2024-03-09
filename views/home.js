function addUIfunctionality(){
    const posts = document.querySelectorAll('.post')

    posts.forEach(post => {
        const comments = post.querySelector('.comments')
        const postCommts = post.querySelector('.postCommts')
        const cbtn = post.querySelector('#commentbtn')
        const postId = post.querySelector('.postId')

        const close = post.querySelector('#close')
        close.addEventListener('click', () => {
            comments.classList.remove('active')
        })
        cbtn.addEventListener('click', () => {
            console.log('Post ID')
            console.log(postId.innerHTML)
            fetch(`/comments/${parseInt(postId.innerHTML)}`)
            .then(data => data.json())
            .then(allcommts => {
                console.log(allcommts)
                postCommts.innerHTML = ''
                allcommts.reverse().forEach(comment => {
                    const commentWrap = document.createElement('div')
                    commentWrap.classList.add('commentWrap')
                    const usercom = document.createElement('div')
                    usercom.classList.add('usercom')
                    const text = document.createElement('p')
                    text.classList.add('msg')
                    const img = document.createElement('img')
                    const div = document.createElement('div')
                    const pname = document.createElement('p')
                    const ptime = document.createElement('p')
                    img.src = comment.commenter_pic
                    pname.innerHTML = comment.commenter_name
                    
                    const d = comment.created_at.toString().split('T')
                    ptime.innerHTML = `${d[0]}`
                    // const d = comment.created_at.toString()
                    // const f = new Intl.DateTimeFormat("en-us", {
                    //     dateStyle: "full"
                    // })
                    //ptime.innerHTML = d
                    text.innerHTML = comment.cont
                    div.appendChild(pname)
                    div.appendChild(ptime)
                    usercom.appendChild(img)
                    usercom.appendChild(div)
                    commentWrap.appendChild(usercom)
                    commentWrap.appendChild(text)
                    postCommts.appendChild(commentWrap)
                })
            }).catch(err => console.log(err))
            comments.classList.add('active')
        })
        //add comment
        const commentinput = post.querySelector('.commentinput')
        const addComment = post.querySelector('.addComment')
        addComment.addEventListener('click', () => {
            console.log('Post ID')
            console.log(postId.innerHTML)
            console.log(commentinput.value)
            if(commentinput.value !== ''){
                fetch(`/comments/${parseInt(postId.innerHTML)}`, {
                    method: "POST",
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({comment: commentinput.value})
                }).then(res => commentinput.value= '')
            } else {
                commentinput.placeholder = 'Type something!!'
                commentinput.classList.add('error')
                setTimeout(() => {
                    commentinput.placeholder = 'Add comment...'
                    commentinput.classList.remove('error')
                }, 3000)
            }
        })
        // add remove likes
        const likebtn = post.querySelector('#likebtn')
        likebtn.addEventListener('click', () => {
            console.log('Post ID from likes')
            console.log(postId.innerHTML)
            fetch(`/likes/${parseInt(postId.innerHTML)}`, {method: "POST"})
            .then(data => data.json())
            .then(res => {
                let s = likebtn.innerHTML.toString().split(" ")
                let prevLikeNum = parseInt(s[0])
                if(res.msg == 'added') likebtn.innerHTML = `${prevLikeNum + 1} likes`
                if(res.msg == 'removed') likebtn.innerHTML = `${prevLikeNum - 1} likes`
            })
        })
        // get each post likes number
        fetch(`/get-post-likes/${parseInt(postId.innerHTML)}`)
        .then(data => data.json())
        .then(likes => {
            likebtn.innerHTML = `${likes.count} likes`
        })
    })
}
addUIfunctionality()

const container = document.querySelector('.container')
const loading = document.createElement('div')
loading.classList.add('loading')
//loading.innerHTML = '<h1>Loading feed...</h1>'
container.appendChild(loading)
let shouldAdd = true
let shouldFetch = true

const postsDiv = document.querySelector('.posts')
let startNum = 10
window.addEventListener('scroll', () => {
    if(window.innerHeight + window.scrollY >= document.body.offsetHeight){
        
        if(shouldAdd == true) loading.innerHTML = `
        <svg>
            <circle cx="15" cy="15" r="15"></circle>
        </svg>
        `
        
        if(shouldFetch == true){
            fetch(`/get-posts/${startNum}`)
            .then(data => data.json())
            .then(res => {
                console.log('array > 0')
                console.log(res.post)
                //startNum += 10
                if(res.posts.length > 0){
                    console.log(res)
                    res.posts.forEach(post => {
                        const div = document.createElement('div')
                        div.classList.add('post')
                        const d = post.created_at.toString().split(' ')
                        if(post.post_pic !== null){
                            div.innerHTML = `
                                <p class="postId" hidden>${post.id}</p>
                                <div class="user">
                                    <img src="${post.warrior_pic}" alt="no">
                                    <p>${post.warrior_name}</p>
                                    <p class="postDate">${d[0]} ${d[1]} ${d[2]} ${d[3]}</p>
                                </div>
                                <div class="content">
                                    <p>${post.texte}</p>
                                    <img src="/${post.post_pic}" alt="no">
                                </div>
                                <div class="reaction">
                                    <p id="likebtn">likes</p>
                                    <p id="commentbtn">comments</p>
                                </div>
                                <div class="addcomment">
                                    <input class="commentinput" type="text" placeholder="Add comment...">
                                    <button class="addComment">
                                        <span id="addComment" class="material-symbols-outlined">send</span>
                                    </button>
                                </div>
                                <div class="comments">
                                    <p id="close">close</p>
                                    <div class="postCommts">
                                        
                                    </div>
                                </div>`
                            postsDiv.appendChild(div)
                        } else {
                            div.innerHTML = `
                                <p class="postId" hidden>${post.id}</p>
                                <div class="user">
                                    <img src="${post.warrior_pic}" alt="no">
                                    <p>${post.warrior_name}</p>
                                    <p class="postDate">${d[0]} ${d[1]} ${d[2]} ${d[3]}</p>
                                </div>
                                <div class="content">
                                    <p>${post.texte}</p>
                                </div>
                                <div class="reaction">
                                    <p id="likebtn">likes</p>
                                    <p id="commentbtn">comments</p>
                                </div>
                                <div class="addcomment">
                                    <input class="commentinput" type="text" placeholder="Add comment...">
                                    <button class="addComment">
                                        <span id="addComment" class="material-symbols-outlined">send</span>
                                    </button>
                                </div>
                                <div class="comments">
                                    <p id="close">close</p>
                                    <div class="postCommts">
                                        
                                    </div>
                                </div>`
                            postsDiv.appendChild(div)
                        }
                    })
                    addUIfunctionality()
                } 
                if(res.posts.length <= 0){
                    console.log('array <<<<<<< 0')
                    console.log(res.post)
                    loading.innerHTML = ''   
                    shouldAdd = false     
                    shouldFetch = false
                }
            })
            startNum += 10
        }
    }
})