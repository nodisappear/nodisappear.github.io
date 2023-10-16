const { readdir } = require('node:fs/promises');

async function listDir() {
	try {
	  const files = await readdir(__dirname);
	  const list = []
	  for (const file of files) {
		  if(/.*[(jpg)|(png)|(jpeg)]+$/g.test(file.toLowerCase())) {
			  list.push("static/" + file)
		  }
	  }
	  return list;
	} catch (err) {
	  console.error(err);
	} 
}

listDir().then((res) => {
	console.log(res);
});