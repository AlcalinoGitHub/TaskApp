<script>
    import {supabase} from '$lib/supabase.js'
    import { onMount } from 'svelte';
    import Cookies from 'js-cookie';
    import {page} from '$app/stores'
    import { writable } from 'svelte/store';
    import './chats.css'
    const chatName = $page.params.Name

    let user = Cookies.get('auth')
    let username;
    let chat;
    let messages = []
    let chatData = writable([])
    let owners;
    let IsAdmin;
    let users
    let Admins
    let AdminsUI = writable([])
    let QueryUI = writable([])

    if (user) {
      user = JSON.parse(user);
      username = user.name; 
    }

    async function validateGroup(){
        const {data, error} = await supabase
            .from('groups')
            .select('*')
            .eq('Name', chatName)
        if (error){console.log(error)} else {return data}
    }
    
    onMount(async  () => {
        chat = await validateGroup()
        chat = (JSON.parse(JSON.stringify(chat[0])))
        owners = chat.Owners
        Admins = chat.Admins
        AdminsUI.set(Admins)
        if (Admins.includes(username)){IsAdmin = true}
        if (owners.includes(username) == false){window.location.href = '/GroupChat'} else {console.log('In chat')}
        messages = chat.messages
        chatData.set(messages)
        users = owners.split(',')
    })

    async function sendMessage(){
        let text = document.getElementById('message').value
        if (text == ''){return}

        document.getElementById('message').value = ''

        let sender = username
        let date = (new Date()).toISOString()
        let newMessage = {
            text: text,
            sender: sender,
            date: date,
            id: [text,sender,date].join(',')
        }
        messages.push(newMessage)
        console.log(messages)

        const {data, error} = await supabase
            .from('groups')
            .update({messages: messages})
            .eq('id', chat.id)
        if (error){console.log(error)} else {chatData.set(messages)}
    }

    async function deleteMessage(messageId){
        if (!IsAdmin){return}
        let newMessages = []
        for (let data of messages){
            if (data.id != messageId){newMessages.push(data)}
        }
        messages = newMessages
        const {data, error} = await supabase
            .from('groups')
            .update({messages: newMessages})
            .eq('id', chat.id)
        chatData.set(newMessages)
        if (error){console.log(error)}
    }

    async function GrantAdmin(user){
        if (!IsAdmin){return}
        Admins.push(user)
        const {data, error} = await supabase
            .from('groups')
            .update({Admins: Admins})
            .eq('id', chat.id)
        AdminsUI.set(Admins)
    }

    async function RevokeAdmin(user){
        if (!IsAdmin){return}
        let NewAdmins = []
        for (let admin of Admins){if (admin != user){NewAdmins.push(admin)}}
        Admins = NewAdmins
        const {data, error} = await supabase
            .from('groups')
            .update({Admins: Admins})
            .eq('id', chat.id)
        AdminsUI.set(Admins)
    }

    async function RemoveUser(user){
        if (!IsAdmin){return}
        let Db_Users = owners.split(',')
        let NewUsers = []
        RevokeAdmin(user)
        for (let person of Db_Users){if (person != user){NewUsers.push(person)}}
        console.log(NewUsers)
        NewUsers = (NewUsers.sort()).join(',')

        const {data, error} = await supabase
            .from('groups')
            .update({Owners: NewUsers})
            .eq('id', chat.id)
        if (error){console.log(error)} else {window.location.href = `/GroupChat/${chatName}`}
    }

    async function SearchUsers(){
        let Db_Users = owners.split(',')
        let search = document.getElementById('search').value  
        let Query = []
        const {data, error} = await supabase
            .from('Users')
            .select('username')
            .not('username', 'eq', username)
        for (let person of data){
            let username = person.username
            if (owners.includes(username) == false && username.startsWith(search)){
                Query.push(username)
            } 
        }
        QueryUI.set(Query)
        console.log(Query)
        return
    } 

    async function AddUser(user){
        if (!IsAdmin){return}
        let NewUsers = owners.split(',')
        NewUsers.push(user)
        NewUsers = (NewUsers.sort()).join(',')

        const {data, error} = await supabase
            .from('groups')
            .update({Owners: NewUsers})
            .eq('id', chat.id)
        if (error){console.log(error)} else {window.location.href = `/GroupChat/${chatName}`}
    }


</script>

<h1>{chatName}</h1> 
<h3>{owners}</h3> <br>


<div class = 'main'>
    <div class = 'chat'>
        {#each $chatData as message}
            <div>
                {#if message.sender == username}
                    <div class = 'own'> {message.sender}: {message.text} </div>
                    <button on:click = {deleteMessage(message.id)} class = 'delete'>Delete</button>
                {:else}
                    <a href = '/chats/{message.sender}'>{message.sender}</a>: <div class = 'other'> {message.text} </div>
                {/if}
            </div>
        {/each}
    </div>
    <form on:submit={sendMessage}>
        <textarea id = 'message'></textarea>
        <input type = 'submit'>
    </form>
</div>


{#if IsAdmin}
    <h3>Edit users</h3>
    {#each users as user}
        <div>
            {user}
            {#if $AdminsUI.includes(user) == false}<button on:click={GrantAdmin(user)}>Grant Admin</button> {/if}
            {#if $AdminsUI.includes(user) && user != username}<button on:click={RevokeAdmin(user)}>Revoke Admin</button> {/if}
            <button on:click={RemoveUser(user)}>Kick Out</button>
        </div>
    {/each}
    <br>

    Add a user
    <input id = 'search' on:input={SearchUsers}>
    {#each $QueryUI as person}
        <div on:click={AddUser(person)}>{person}</div>
    {/each}

{/if}
