<script>
    import '../accounts.css'

    async function register(){
        let error =  document.getElementById('error') //resets the error message
            error.innerHTML = ''
            error.classList.remove('failureOn')

        let username = document.getElementById('username').value
        let password = document.getElementById('password').value
        
        let user = {name: username, 
                    pass: password, 
                    type: 'register'}

        if (username == ''){
            let error =  document.getElementById('error')
            error.innerHTML = 'Username cant be empty'
            error.classList.toggle('failureOn')
            return}
        if (password.length < 4){
            let error =  document.getElementById('error')
            error.innerHTML = 'Password must be at least 5 characters long'
            error.classList.toggle('failureOn')
            return
        }
        let response  = await fetch('/accounts', {
            method: 'POST',
            body: JSON.stringify(user)
        })

        if (response.ok){
            let data = await response.json()
            if (data == false)
            {error.innerHTML = 'Username Taken'; error.classList.toggle('failureOn')}
            else (window.location.href = '/accounts/login')
        } else {alert('An error ocurred while handling your register' + response.status)}

    }
</script>



<form on:submit={register}>
    <div class = 'title'>register</div>
    <input type = 'text' id = 'username' placeholder="username">
    <input type = 'password' id = 'password' placeholder="password">
    <input type = 'submit' class = 'submit'>
    <div id = 'error' class = 'failure'></div>
</form>