var http = require('http');
var fs = require('fs');
var url = require('url');
var qs= require('querystring');


function tempHtml(list, title, description){
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
            <link rel="icon" href="logo.png" sizes="16x16">

            <title>TodoList</title>

        </head>
        <body>
            <h1><a href="/" style="color: red">TodoList</a></h1>
            <p>TodoList에 오신 걸 환영합니다!!</p>

            <button type="button" class="btn"><a href="/create">Create</a></button>

            ${list}

            <h1>${title}</h1>

            <p>${description}</p>


            <footer class="container-fluid text-center">
                    <p>© 2019 | Minza Thinking Project</p>
                    <p>Theme by Minza</p>
            </footer>
        </body>
        </html>
    `;
}

function tempList(filelist){
    var list = '<ul class="list-group">';
    var i = 0;
    while(i < filelist.length){
        list = list + `<li class="list-group-item"><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i = i + 1;
    }
    list = list + '</ul>';
    return list;
}


var app = http.createServer(function(request, response){
    var _url = request.url;
    var pathname = url.parse(_url, true).pathname;
    var queryData = url.parse(_url, true).query;
    

    if(pathname === '/'){
        if(queryData.id === undefined){
            fs.readdir('./data', function(error, filelist){
                var list = tempList(filelist);
                var title = '';
                var description = 'TodoList에 오신 걸 환영합니다!!';
                var html = tempHtml(list, title, description);
                response.writeHead(200);
                response.end(html);
            });
            
        }else{
            fs.readdir('./data', function(error, filelist){
                var list = tempList(filelist);

                fs.readFile(`./data/${queryData.id}`, 'utf-8', function(err, data){
                    var title = queryData.id;
                    var description = data;
                    
                    var html = tempHtml(list, title, description);
                   
                    response.writeHead(200);
                    response.end(html);
                });
                
            });
        }
        
        
    }else if(pathname === '/create'){
        var index = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
                <link rel="icon" href="logo.png" sizes="16x16">

                <title>TodoList</title>

            </head>
            <body>
                <h1><a href="/" style="color: red">TodoList</a></h1>
                
                <p>할 일을 등록합시다!</p>

                <div>내용을 입력해주세요</div>

                <form action="http://localhost:3000/create_process" method="post">
                    <p><input type="text" name="title" placeholder="제목을 입력해주세요!"></p>
                    <p>
                        <textarea name="description" placeholder="내용을 적어주세요....."></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
  
            </body>
            </html>
        `;

        response.writeHead(200);
        response.end(index);

        
    }else if(pathname === '/create_process'){
        var body ='';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            
            var title = post.title;
            
            var description = post.description;
            fs.writeFile(`./data/${title}`, description, 'utf-8', function(err){
                response.writeHead(302, {Location: `/`});
                response.end();
            })
        });
    }
    else{
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);