<script>
    import './chats.css'
    import {page} from '$app/stores'
    import {validate} from '$lib/validateAuth.js'
    import {supabase} from '$lib/supabase.js'
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import Cookies from 'js-cookie';
    const chatUsername = $page.params.username

    let user = Cookies.get('auth')
    let username;

    if (user) {
      user = JSON.parse(user);
      username = user.name; 
    } else try{{window.location.href = '/'}} catch {}

    let isAuth = false
    let authResult = validate()
    authResult.then((result) => {if (result){isAuth = true}})

    let ChatUsers = [username, chatUsername].sort()

    async function validateChat() {
        const {data, error} = await supabase
            .from('Users')
            .select('*')
            .eq('username', chatUsername)
        if (data.length == 0){console.log('INVALID CHAT') ;return false}
        else {console.log('VALID CHAT'); return true}
    }

    async function getChat() {
        let valid = await validateChat()
        if (!valid){window.location.href = '/'}

        const {data, error} = await supabase
            .from('chats')
            .select('*')
            .eq('owners', `${ChatUsers.join(',')}`)
        if (error){console.log(error)}
        if (data.length != 0){return data[0]} 
        else {
            let messages = []
            let owners = ChatUsers.join(',')
            const {data, error} = await supabase
                .from('chats')
                .insert([{owners, messages}])
            console.log('Chat not found')
            window.location.href = `/chats/${chatUsername}`
        }
    }

    let chatData = writable([])
    let ChatId;
    let data;
    onMount(async () => {
        data = await getChat()
        data = JSON.parse(JSON.stringify(data))
        console.log(data)
        chatData.set(data.messages)
        ChatId = data.id
        reFecth()
    })

    async function newMessage() {
        let message = document.getElementById('newMessage').value
        document.getElementById('newMessage').value = ''
        let db_data = await getChat()
        db_data = db_data.messages.slice()
        console.log(message)
        let messageData = {
            text: message,
            sender: username,
            date: (new Date()).toISOString(),
            id: `${message},${username},${(new Date).toISOString()}`
        }
        let db_messages = []
        console.log(db_data)
        db_data.push(messageData)

        const {data, error} = await supabase 
            .from('chats')
            .update({messages: db_data})
            .eq('id', ChatId)
        if (error){console.log(error)}
        chatData.set(db_data)
    }

    async function deleteMessage(id){
        let db_data = await getChat()
        db_data = db_data.messages.slice()
        let newData = []
        for (let entry of db_data){
            if (entry.id != id){newData.push(entry)}
        }
        db_data = newData
        const {data, error} = await supabase 
            .from('chats')
            .update({messages: db_data})
            .eq('id', ChatId)
        if (error){console.log(error)}
        chatData.set(db_data)
    }

    async function reFecth() {
        ChatUsers = [username, chatUsername].sort()
        const {data, error} = await supabase
            .from('chats')
            .select('messages')
            .eq('id', ChatId)
        let datos = data[0]
        datos = datos.messages
        chatData.set(datos)
        setInterval(reFecth, 10000)
    }

    async function update() {
        ChatUsers = [username, chatUsername].sort()
        const {data, error} = await supabase
            .from('chats')
            .select('messages')
            .eq('id', ChatId)
        let datos = data[0]
        datos = datos.messages
        chatData.set(datos)
    }



</script>

<h1>Chat with {chatUsername}</h1>
<button on:click={update} class = 'refresh'>reFresh</button>

<div class = 'chat'>
    {#each $chatData as message}
        {#if message.sender == username}
            <div class = 'own'> {message.sender}:<br>{message.text}</div>
            <button on:click={deleteMessage(message.id)} class = 'delete'>Delete</button>
        {:else}
            <div class = 'other'> {message.sender}:<br>{message.text}   </div>
        {/if}
        <br>
    {/each}
</div>

<form on:submit={newMessage}>
    <textarea id = 'newMessage'></textarea>
    <input type = 'submit' class = 'submit'>
</form>

