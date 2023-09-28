const express = require('express')
const fs = require('fs')
const qs = require('querystring')
const app = express()
const port = 3000
const template = require('./lib/template.js')
app.get('/', (req, res)=>{
    let {name} = req.query
    fs.readdir('page', (err, files)=>{
        let list = template.list(files)
        fs.readFile(`page/${name}`, 'utf8', (err,data)=>{
            let control = `<a href="/create">create</a> <a href="/update?name=${name}">update</a>
            <form action="delete_process" method="post">  <!-- 링크로 이동하지 않고 바로 삭제 구현 -->
                <input type='hidden' name='id' value='${name}'>
                <button type="submit">delete</button>
            </form>
            `
            if(name === undefined){
                name = 'sunrin'
                data = 'Welcome'
                control = `<a href="/create">create</a>`
            }
            const html = template.HTML(name, list, `<h2>${name} 페이지</h2><p>${data}</p>`, control)
            res.send(html)  
        })
    })
})
app.get('/create', (req, res)=>{
    fs.readdir('page', (err, files)=>{
        const name = 'create'
        const list = template.list(files)
        const data = template.create()
        const html = template.HTML(name, list, data, '')
        res.send(html)
    })
})
app.get('/update', (req, res)=>{
    let {name} = req.query
    fs.readdir('page', (err, files)=>{
        let list = template.list(files)
        fs.readFile(`page/${name}`, 'utf8', (err,content)=>{
            let control = `<a href="/create">create</a> <a href="/update?name=${name}">update</a>
            <form action="delete_process" method="post">  <!-- 링크로 이동하지 않고 바로 삭제 구현 -->
                <input type='hidden' name='id' value='${name}'>
                <button type="submit">delete</button>
            </form>
            `
            const data = template.update(name, content)
            const html = template.HTML(name, list, `<h2>${name} 페이지</h2><p>${data}</p>`, control)
            res.send(html)  
        })
    })
})
app.post('/create_process', (req, res)=>{
    let body = ''
    req.on('data', (data)=>{
        body = body + data
    })
    req.on('end', ()=>{
        const post = qs.parse(body)
        const title = post.title
        const decription = post.decription
        fs.writeFile(`page/${title}`, decription, 'utf8', (err)=>{
            res.redirect(302, `/?name=${title}`)
        })
    })
})
app.post('/update_process', (req, res)=>{
    let body = ''
    req.on('data', (data)=>{
        body = body + data
    })
    req.on('end', ()=>{
        const post = qs.parse(body)
        const id = post.id
        const title = post.title
        const decription = post.decription
        fs.rename(`page/${id}`, `page/${title}`, (err)=>{  // 파일명 변경 시 처리
            fs.writeFile(`page/${title}`, decription, 'utf8', (err)=>{
                res.redirect(302, `/?name=${title}`)
            })    
        })
    })
})
app.post('/delete_process', (req, res)=>{
    let body = ''
    req.on('data', (data)=>{
        body = body + data
    })
    req.on('end', ()=>{
        const post = qs.parse(body)
        const id = post.id
        fs.unlink(`page/${id}`, (err)=>{  // 파일 삭제 처리
            res.redirect(302, `/`)  //  삭제 후 홈으로 redirect
        })
    })
})
app.listen(port, ()=>{
    console.log(`server running on port ${port}`)
})