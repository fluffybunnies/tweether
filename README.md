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
- Write tests
	- Specifically for error handling
- Clean up package (remove unused libs/tests/npm-modules)
- Split up stream and single cb req for twitter api + update twitterwrite (similar to api)
- Sample script to forever the thing
- Update to streams2? (e.g. through etc)
