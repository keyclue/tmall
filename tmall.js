var express = require('express');
	var jpeg = require('jpeg-js');
	var async = require('async');
var url          = require('url');
var _            = require("underscore");
var path         = require('path');
	var fs = require('fs');
var http = require('http');
var multer = require('multer');
var fileupload = require('express-fileupload');
var shopifyAPI = require('shopify-node-api');

	/*  var Shopify = new shopifyAPI({
		shop: 'test-royalcrown', 
		shopify_api_key: '4674cdffb066b92fe28192a0e6d127bb',
		shopify_shared_secret: '525d878c3b3154dd5dcdb11bc6e574c0',
		access_token: 'c03fac20be684f535c28c8387e091fd3', //permanent token 
	});  */
	var Shopify = new shopifyAPI({
  shop: 'keyclue-wholesale-store', // MYSHOP.myshopify.com 
  shopify_api_key: 'aa2839db2d7cd62e8b5d9094ea359616', // Your API key 
  access_token: 'a0577311b7e283cd4b3e9a7396326a00' // Your API password 
}); 
var expressSession = require('express-session');
var app = express();
var server = http.createServer(app);
var db = require('./config/database');
// var Admin        = require('./model/admins');
var mongoose = require('mongoose');
var mongo = require('mongodb');
var crypto           = require("crypto");
var algorithm        = "aes-256-ctr";
var password         = "d6F3Efeq";
var Auth   = require('./middleware/auth');
var login                = require("./controllers/login.js");
var brand                = require("./controllers/brand.js");
var collection                = require("./controllers/collection.js");
var cloudinary                = require("./API-Clients/cloudinary.js");
var googleSheet                = require("./API-Clients/googleSheet.js");
var uristring = 'mongodb://admin:admin123@ds135926.mlab.com:35926/heroku_914rlv3g';
app.set('port', (process.env.PORT || 80));

app.use(express.static(__dirname + '/public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
   extended: false
}));
app.use(bodyParser.json());
app.use(fileupload());
app.use(expressSession({secret:'max',saveUninitialized:false,resave:false,
    maxAge: 7 * 24 * 3600 * 1000
}));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.all('/search_product', function(request, response) {
	var taobao = require('taobao');
	taobao.core.call({
		method: 'get',				//可选，默认为get, 各个API需要的method可能不一样，请参阅淘宝API文档 
		protocol: 'http',			//可选，默认为http, 指定协议，支持http, https 
		sandbox: false				//可选，默认为false, 指定是否为沙箱环境，可通过taobao.config配置默认值 
	}, {
		'app_key': '23557753',
		'app_secret': 'fe07dd33eac65c1b13324395a2cde358',
		'session': '61000051ff9e5102f2b320f2a2e773f0dafecc6ca1e5bd13031625218',
		'method': 'taobao.product.get',
	/* 	'fields': 'product_id,name,pic_url,cid,props,price,tsc',
		'cid': '50011999',
		'status': '3'	 */
		  'fields':'product_id,name,pic_url',
    'product_id':'696399720',
    'cid':'50011999',
	}, function(data) {
		response.send(data);
	});
});


app.all('/upload_image', function(request, response) {
	var taobao = require('taobao');
	var base64Img = require('base64-img'); // uninstall this module
	var data = base64Img.base64Sync('./photo.jpg');
	var jpegData = fs.readFileSync('./photo.jpg');
	var rawImageData = jpeg.decode(jpegData);
	taobao.core.call({
		method: 'get',				//可选，默认为get, 各个API需要的method可能不一样，请参阅淘宝API文档 
		protocol: 'http',			//可选，默认为http, 指定协议，支持http, https 
		sandbox: false				//可选，默认为false, 指定是否为沙箱环境，可通过taobao.config配置默认值 
	}, {
		'app_key': '23557753',
		'app_secret': 'fe07dd33eac65c1b13324395a2cde358',
		'session': '61000051ff9e5102f2b320f2a2e773f0dafecc6ca1e5bd13031625218',
		'method': 'taobao.picture.upload',
	   'picture_category_id':'123',
    'img':rawImageData.data,
    'image_input_title':'Bule.jpg'
	}, function(data) {
		response.send(data);
	});
});


app.all('/add_product', function(request, response) {
	var jpeg = require('jpeg-js');
	var jpegData = fs.readFileSync('./photo.jpg');
	var rawImageData = jpeg.decode(jpegData, true);
	var taobao = require('taobao');
	
	taobao.core.call({
		'app_key': '23557753',
		'app_secret': 'fe07dd33eac65c1b13324395a2cde358',
		'session':'61000051ff9e5102f2b320f2a2e773f0dafecc6ca1e5bd13031625218',
		'method': 'taobao.product.add',
		'partner_id': 'top-apitools',
		'cid':'50011999',
		'parent_cid':'0',
		'outer_id':'96330012',
		'props':'pid:vid;pid:vid',
		'binds':'pid:vid;pid:vid',
		'sale_props':'pid:vid;pid:vid',
		'customer_props':'20000:UNIQLO:Model:001:632501:1234',
		'price':'200.07',
		'image': rawImageData,         
	
		'name':'notebook',
		'desc':'Thisisaproductdescription',
		'major':'true',
		'vertical_market':'4',
		'market_time':'2018-01-01 00:00:00',
		'property_alias':'1627207:3232483:Deepgreen',
		'packing_list':'Instructions:1;headset:1;charger:1',
	   'extra_info':'{"field_key": "description", "field_name": "Introduction", "field_value": "I am the introduction"}, {"field_name": "directory", "field_value": "I am the directory"}',
		'market_id':'2',
		'sell_pt':'Starthesameparagraph',
		'template_id':'1',
		'suite_items_str':'1000000062318020:1;1000000062318020:2;',
	   'is_pub_suite':'false'
		
	}, function(error, data) {
		console.log("error" + error);
		console.log("data" + data);
		response.send(error);
	});
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


