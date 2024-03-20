
const warriorId = parseInt(document.querySelector('#userId').innerHTML)
const warriorName = document.querySelector('#warriorName').innerHTML

const socket = io()
socket.emit('signin', {userId: warriorId, username: warriorName})

const chatWindowContainer = document.querySelector('.chatWindowContainer')

const users = document.querySelectorAll('.user')
users.forEach(user => {
    const username = user.querySelector('.username')
    const userId = user.querySelector('.userId')
    user.addEventListener('click', () => {
        chatWindowContainer.innerHTML = `
        <div class="window">
                <div class="toolbar">
                    <p id="close">X</p>
                    <p id="chatname">${username.innerHTML}</p>
                </div>
                <div class="content">
                    
                </div>
                <div class="input">
                    <div>
                        <input id="msginput" name="msg" type="text" placeholder=" Write message...">
                        <label for="imageBtn"><span class="material-symbols-outlined">imagesmode</span></label>
                        <input id="imageBtn" name="image" type="file">
                        <button id="send">
                            <span id="sendMsg" class="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </div>
        `
        // AJAX with user ID
        const contentDiv = document.querySelector('.content')
        
        const b = {warriorId: warriorId, warriorName: warriorName, fellowName: username.innerHTML, fellowId: parseInt(userId.innerHTML)}
        fetch('/get-messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(b)
        }).then(data => data.json())
        .then(res => {
            // previous msgs
            res.forEach(msg => {
                if(msg.sent_from == warriorId){
                    const pme = document.createElement('p') 
                    pme.classList.add('msgMe')
                    pme.innerHTML = msg.msg
                    contentDiv.appendChild(pme)
                } else {
                    const phim = document.createElement('p') 
                    phim.classList.add('msgHim')
                    phim.innerHTML = msg.msg
                    contentDiv.appendChild(phim)
                }
            })
            contentDiv.scroll(0, contentDiv.scrollHeight)
        })
        // add msgs to UI & send msgs to server with socket
        const msginput = document.querySelector('#msginput')
        const sendBtn = document.querySelector('#send')
        sendBtn.addEventListener('click', () => {
            const msg = {fromId: warriorId, fromName: warriorName, toName: username.innerHTML, toId: parseInt(userId.innerHTML), msg: msginput.value}
            socket.emit('messagePrivate', msg)
            const pme = document.createElement('p') 
            pme.classList.add('msgMe')
            pme.innerHTML = msginput.value
            contentDiv.appendChild(pme)
            msginput.value = ''
            contentDiv.scroll(0, contentDiv.scrollHeight)
        })
        // listen for incoming msgs
        socket.on('incoming', (packet) => {    
            const chatname = document.querySelector('#chatname').innerHTML
            if(chatname == packet.fromName){
                const phim = document.createElement('p') 
                phim.classList.add('msgHim')
                phim.innerHTML = packet.msg
                contentDiv.appendChild(phim)
                contentDiv.scroll(0, contentDiv.scrollHeight)
            }
        })
        const closeBtn = document.querySelector('#close')
        closeBtn.addEventListener('click', () => {
            chatWindowContainer.innerHTML =  ''
        })
    })
})
