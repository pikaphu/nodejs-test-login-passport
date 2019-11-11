const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    // auth validation
    const authenticateUser = async (email , password, callback_done) => {
        console.log('AuthenUser:', email, password);
        const user = getUserByEmail(email)
        if (user == null) {
            // not found
            console.log('Login failed: user not found');
            return callback_done(null, false, { message: 'User or Email not found!'})
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                // success: return user data
                console.log('Login Success: ', user);
                return callback_done(null, user)
            } else {
                // fail: password 
                console.log('Login failed: password');
                return callback_done(null, false, { message: 'Password incorrect'})
            }
        } catch (error) {
            console.log('Login error');
            return callback_done(error)
        }

    }

    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, callback_done) => callback_done(null, user.id))
    passport.deserializeUser((id, callback_done) => {
        return callback_done(null, getUserById(id))
    })
}

module.exports = initialize;