# tweether


```
git clone git@github.com:fluffybunnies/tweether.git
cd tweether
npm install

vim config.local.json
# add twitter creds

# test
node ./test/twitterstream.js

# run
node ./index.js
```


## To Do
- Debug in_reply_to_status_id
-- Likely the same reason we can't use both loc and track together
- Write tests
- Clean up package
- Sample script to forever the thing

