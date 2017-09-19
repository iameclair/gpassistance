const accountSid = 'AC8dd22b7052680607a0a894b02856566f';
const authToken = '5bc67c53b069bdbcbbe737d07a4e6e67';

const client = require('twilio')(accountSid, authToken);

client.messages.create({
   to: '+447957314191',
   from: '+441173252242',
   body: 'Your are amazing man!'
},(err, message) =>{
    if(err){
        console.log(err)
    }else{
        console.log(message.sid);
    }
});


