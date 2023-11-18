import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';


passport.use(
    new GoogleStrategy(
        {
            clientID: "",
            clientSecret: "",
            callbackURL: "http://localhost:5000/auth/google/callback",
            passReqToCallback: true,
        },
        (request, accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});