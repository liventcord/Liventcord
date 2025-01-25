"use strict";(self.webpackChunklivent_cord_docs=self.webpackChunklivent_cord_docs||[]).push([[727],{905:(e,t,a)=>{a.r(t),a.d(t,{contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var r=a(8168),n=(a(6540),a(5680));const i={sidebar_position:1},o="Set Enviroment Variables",l={unversionedId:"tutorial-basics/set-enviroment-variables",id:"tutorial-basics/set-enviroment-variables",isDocsHomePage:!1,title:"Set Enviroment Variables",description:"1. Create the Properties/appsettings.json file",source:"@site/docs/tutorial-basics/set-enviroment-variables.md",sourceDirName:"tutorial-basics",slug:"/tutorial-basics/set-enviroment-variables",permalink:"/LiventCord/tutorial-basics/set-enviroment-variables",editUrl:"https://github.com/LiventCord/liventcord/edit/dev/docs/docs/tutorial-basics/set-enviroment-variables.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"Tutorial Intro",permalink:"/LiventCord/"},next:{title:"Docker Quick Start",permalink:"/LiventCord/docker"}},s=[],p={toc:s},g="wrapper";function m(e){let{components:t,...a}=e;return(0,n.yg)(g,(0,r.A)({},p,a,{components:t,mdxType:"MDXLayout"}),(0,n.yg)("h1",{id:"set-enviroment-variables"},"Set Enviroment Variables"),(0,n.yg)("ol",null,(0,n.yg)("li",{parentName:"ol"},(0,n.yg)("p",{parentName:"li"},"Create the ",(0,n.yg)("inlineCode",{parentName:"p"},"Properties/appsettings.json")," file")),(0,n.yg)("li",{parentName:"ol"},(0,n.yg)("p",{parentName:"li"},"Add the following JSON configuration:"),(0,n.yg)("pre",{parentName:"li"},(0,n.yg)("code",{parentName:"pre",className:"language-json"},'{\n  "AppSettings": {\n    "Host": "127.0.0.1",\n    "Port" : "5005",\n    "RemoteConnection": "CONNECTION_STRING",\n    "DatabaseType": "DATABASE_TYPE",\n    "SqlitePath": "Data/database.db",\n    "GifWorkerUrl": "WORKER_URL",\n    "MaxAvatarSize" : "MAX_AVATAR",\n    "MaxAttachmentsSize" : "MAX_ATTACHMENTS"\n  }\n}\n')))),(0,n.yg)("ul",null,(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("p",{parentName:"li"},(0,n.yg)("strong",{parentName:"p"},"Host"),":\nHostname the server will run at.\nDefaults to 0.0.0.0")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("p",{parentName:"li"},(0,n.yg)("strong",{parentName:"p"},"Port"),":\nPort the server will run at.\nDefaults to 5005")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("p",{parentName:"li"},(0,n.yg)("strong",{parentName:"p"},"RemoteConnection"),":\nConnection string for the database.")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("p",{parentName:"li"},(0,n.yg)("strong",{parentName:"p"},"DatabaseType"),":\nType of database server for data storage. Supported options:"),(0,n.yg)("ul",{parentName:"li"},(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("strong",{parentName:"li"},"PostgreSQL")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("strong",{parentName:"li"},"MySQL")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("strong",{parentName:"li"},"MariaDB")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("strong",{parentName:"li"},"Oracle")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("strong",{parentName:"li"},"Firebird")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("strong",{parentName:"li"},"SqlServer")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("strong",{parentName:"li"},"SQLite"),'\nDefaults to "sqlite" if not provided.'))),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("p",{parentName:"li"},(0,n.yg)("strong",{parentName:"p"},"SqlitePath"),"\nFile path where SQLite will store data\nDefaults to Data/liventcord.db")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("p",{parentName:"li"},(0,n.yg)("strong",{parentName:"p"},"GifWorkerUrl"),':\nURL of the Cloudflare Worker for querying Tenor GIFs.\nDefaults to "liventcord-gif-worker.efekantunc0.workers.dev"')),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("p",{parentName:"li"},(0,n.yg)("strong",{parentName:"p"},"MaxAvatarSize"),":\nMaximum upload size(in MB) for avatar on guilds and profiles\nDefaults to 3")),(0,n.yg)("li",{parentName:"ul"},(0,n.yg)("p",{parentName:"li"},(0,n.yg)("strong",{parentName:"p"},"MaxAttachmentsSize"),":\nMaximum attachment size (in MB) allowed for message uploads.\nDefaults to 30"))))}m.isMDXComponent=!0}}]);