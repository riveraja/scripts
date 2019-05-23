const MongoClient = require('mongodb').MongoClient;
//var argv=require('yargs').argv;
var faker = require('faker')

run().catch(error => console.error(error));

function print(v) { console.log(v); }

async function run() {
    //url=argv._[0]
    //auth="//"+argv.username+":"+argv.password+"@"
    //url=url.replace(/\/\//,auth)
    client = await MongoClient.connect("mongodb://mongos0:27018/test", { useNewUrlParser: true })
    const db = await client.db();

    promisewait = []

    count = 100

    var start = new Date().getTime()

    collection = db.collection("testcoll")
    for (i = 0; i < count; i++) {
        var randuuid=faker.random.uuid();
        var randFName=faker.name.firstName();
        var randLName=faker.name.lastName();
        var jobTitle=faker.name.jobTitle();
        promisewait.push(collection.insertOne({ 
            "uid": randuuid, 
            "fname": randFName, 
            "lname": randLName, 
            "jobtitle": jobTitle 
        }));
    }

    Promise.all(promisewait).then(res => {
        var end = new Date().getTime();
        print(end - start);
        process.exit(0);
    }).catch(err => {
        console.log(err);
        process.exit(1);
    }
    )
}
