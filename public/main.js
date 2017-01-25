'use strict'

const app = (function() {
    function init() {
        this.socket = io()

        this.form = document.querySelector('#messageForm')
        this.form.addEventListener('submit', handleSubmit.bind(this))
        this.messageBox = document.querySelector('#messages')
        this.messages = document.querySelector('#messages > ul')
        this.userList = document.querySelector('#userList')

        this.form.classList.add('hidden')
        this.messageBox.classList.add('hidden')

        this.userForm = document.querySelector('#userForm')
        this.userForm.addEventListener('submit', handleUserSubmit.bind(this))

        this.socket.on('new message', handleNewMessage.bind(this))
        this.socket.on('history', loadHistory.bind(this))
        this.socket.on('users', updateUserList.bind(this))
    }

    function clearList(list) {
        while(list.firstChild)
            list.removeChild(list.firstChild)
    }

    function handleSubmit(e) {
        e.preventDefault()
        this.messageBox = document.querySelector('#message')
        const message = this.messageBox.value
        if(!message) return
        this.socket.emit('chat message', message)
        this.messageBox.value = ''
        return false
    }

    function handleUserSubmit(e) {
        e.preventDefault()
        const username = document.querySelector('#username').value
        if(!username) return
        this.socket.emit('new user', username)
        this.form.classList.remove('hidden')
        this.messageBox.classList.remove('hidden')
        this.userForm.classList.add('hidden')
        return false
    }

    function handleNewMessage(data) {
        const li = document.createElement('li')
        li.classList.add('list-group-item')
        const content = `${data.user}: ${data.msg}`
        li.textContent = content
        this.messages.appendChild(li)
    }

    function loadHistory(history) {
        history.map(data => handleNewMessage.call(this, data))
    }

    function updateUserList(data) {
        const li = document.createElement('li')
        li.classList.add('list-group-item')
        li.classList.add('faded')
        li.textContent = `${data.username} ${data.action}`
        this.messages.appendChild(li)

        const users = data.users
        clearList(this.userList)
        const formatted = users.map(user => {
            const li = document.createElement('li')
            li.classList.add('list-group-item')
            li.textContent = user
            return li
        })
        formatted.map(user => {
            this.userList.appendChild(user)
        })
    }

    return {
        init
    }
})()

document.addEventListener('DOMContentLoaded', () => {
    app.init()
})
