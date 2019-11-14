const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    // auth validation
    const authenticateUser = async (email, password, verify_done) => { // done=(err, user, info)
        console.log('AuthenUser:', email, password);
        const user = getUserByEmail(email)
        if (user == null) {
            // not found
            console.log('Login failed: user not found');
            return verify_done(null, false, {
                message: 'User or Email not found!'
            })
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                // success: return user data
                console.log('Login Success: ', user);
                return verify_done(null, user)
            } else {
                // fail: password 
                console.log('Login failed: password');
                return verify_done(null, false, {
                    message: 'Password incorrect'
                })
            }
        } catch (error) {
            console.log('Login error');
            return verify_done(error)
        }

    }

    passport.use(new LocalStrategy({
        usernameField: 'email' // username
    }, authenticateUser)) // password
    passport.serializeUser((user, callback_done) => callback_done(null, user.id))
    passport.deserializeUser((id, callback_done) => {
        return callback_done(null, getUserById(id))
    })
}

module.exports = initialize;