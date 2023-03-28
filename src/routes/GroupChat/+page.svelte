<script>
    import {supabase} from '$lib/supabase.js'
    import { onMount } from 'svelte';
    import Cookies from 'js-cookie';
    import './accounts.css'
    let user = Cookies.get('auth')
    let username;

    if (user) {
      user = JSON.parse(user);
      username = user.name; 
    }

    let users = []
    let Query = []
    let Added = []
    let chats = []

    async function getUsers(){
        const {data, error} = await supabase
            .from('Users')
            .select('username')
            .not('username', 'eq', username)
        return data.map(({ username }) => ({ username }));
    }

    async function getChats(){
        const {data, error} = await supabase
            .from('groups')
            .select('*')
        if (error){console.log(error)} else{return data.map(({Name}) => ({Name}))}
    }

    onMount(async ()  => {
        users = await getUsers()
        chats = await getChats()
        console.log(chats)
    })

    function searchUsers(){
        Query = []
        let search = document.getElementById('search').value
        for (let user of users){
            if (user.username.startsWith(search) || user.username.startsWith(search.toUpperCase()) || user.username.startsWith(search.toLowerCase())){
                Query.push(user.username)
            }
        }
        return
    }

    function addUsers(user){
        if (Added.includes(user)){return}
        let copy = Added.slice()
        copy.push(user)
        Added = copy
    }

    function removeUser(user){
        if (Added.includes(user) == false){return}
        let newUsers = []
        for (let name of Added){
            if (name != user){newUsers.push(name)}
        }
        Added = newUsers
    }

    async function createChat(users){
        if (Added.length == 0){return}
        let members = Added.slice()
        members.push(username)
        let Owners = (members.sort()).join(',')
        let messages = []
        let Name = document.getElementById('name').value
        let Admins = [username]
        if (users.length == 0){return}
        console.log(users)
        const {data, error} = await supabase
            .from('groups')
            .insert([{Owners, messages, Name, Admins}])
        if (error){console.log(error); alert('That group name is Taken')} else {alert('Chat Created!')}
    }

    function enterChat(chatName){
        window.location.href = `/GroupChat/${chatName}`
    }
</script>



<div class = 'title'>Access or create a group chat</div>

<div class = 'create'>
    <div class = 'welcome'>Create a chat</div>
    <input type = 'text' id = 'name' placeholder="Name for the chat"> <br>
    <input type = 'text' name = 'search' id = 'search' on:input={searchUsers} placeholder="select users to add"> <br>
    {#each Query as user}
        {#if Added.includes(user) == false}
            <div on:click={addUsers(user)} class = 'toAdd'>{user}</div> 
        {/if}
    {/each}

    <h4 class = 'subtitle'>Added</h4>
    {#each Added as user}
        <div class = 'added' on:click={removeUser(user)}>{user}</div>
    {/each}
    <input type = 'submit' on:click={createChat(Added)}>
</div>

<div class = 'access'>
    <h3 class = 'welcome'>Access a chat</h3>
    {#each chats as chat}
        <div on:click = {enterChat(chat.Name)} class = 'group'>{chat.Name}</div> 
    {/each}
</div>