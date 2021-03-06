const mysql = require("../msql");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken') 


// cria um usuario
exports.criaUsuario = async(req,res,next)=> {
    try {
        const result = await mysql.execute("SELECT * FROM usuarios WHERE email = ?;",[req.body.email]);
        if (result.length > 0) {
            return res.status(409).send({ message: 'Usuário já cadastrado' })
        }else{
            const hash =  bcrypt.hashSync(req.body.senha, 10);

            const query = 'INSERT INTO usuarios (email,senha,nome) VALUES (?,?,?);';
            await mysql.execute(query,[req.body.email,hash,req.body.nome]);   
            const response = {
                mensagem: 'usuario inserido com secesso',
                empresaCriada: {
                    email:req.body.email,
                    senha:req.body.senha,
                    nome:req.body.nome,
                    imagem:'http://localhost:3003/',
                    request:{
                        tipo: 'GET',
                        descricao:'retorna usuario com email',
                        url:'http://localhost:3003/usuarios/' + req.body.email
                    }  
                }
            }       
        return res.status(201).send(response);
        };
    } catch (error) {
        return res.status(500).send({ error: error });
    };
};

// retorna todos os usuarios
exports.getUsuarios = async(req,res)=> {
    try {
        const result = await mysql.execute("SELECT * FROM usuarios;");     
        if (result.length == 0) {
            return res.status(401).send({
                message: 'Não foi encontrado usuario'
            });
        };
        const response = {
            id: result.lenght,
            usuarios: result.map(user => {
                return{
                    email: user.email,
                    senha: user.senha,
                    imagem:'http://localhost:3003/'+user.imagem,
                    nome:user.nome,
                    request:{
                        tipo: 'GET',
                        descricao:'retorna email do usuario',
                        url:'http://localhost:3003/usuarios/'+ user.email
                    }                     
                }
            })
        };
        return res.status(200).send(response);        
    } catch (error) {
        return res.status(500).send({ error:error});                
    };
};
// retorna usuario pelo email
exports.usuarioEmail = async(req,res)=> {
    try {
        const query = 'SELECT * FROM usuarios WHERE email = ?;';
        const result = await mysql.execute(query,[req.params.email]);
        
        if (result.length == 0) {
            return res.status(401).send({
                message: 'Não foi encontrado usuario'
            });
        };
        const response = {
            usuarioComEmail:{
                email: result[0].email,
                senha:result[0].senha,
                nome:result[0].nome,
                imagem:'http://localhost:3003/'+result[0].imagem,
                request:{
                    tipo: 'GET',
                    descricao:'retorna um todos usuarios',
                    url:'http://localhost:3003/usuarios/'
                }   
            }

        };
        return res.status(201).send(response);    
    } catch (error) {
        return res.status(500).send({ error:error});          
    };
};
// altera usuario
exports.alteraUsuario = async(req,res)=> {
    try {
        const result = await mysql.execute("SELECT * FROM usuarios WHERE email = ?;",[req.body.email]);
        if (result.length == 0) {
            res.status(401).send({
                message: 'Não foi encontrado'
            });
        }else{
            const hash = await bcrypt.hashSync(req.body.senha, 10);
            const query = 
                `UPDATE usuarios
                    SET nome   = ?, 
                        senha  = ?,
                        imagem = ? 
                WHERE email = ?;`;
            await mysql.execute(query,
            [
            req.body.nome,
            hash,
            req.body.email,
            req.file.path
            ]);
            const response = {
                mensagem: 'usuario atualizado com secesso',
                Atualizada: {
                    email:req.body.email,
                    senha:req.body.senha,
                    nome:req.body.nome,               
                    imagem:'http://localhost:3003/'+ req.file.path,                    
                    request:{
                        tipo: 'GET',
                        descricao:'retorna email do usuario',
                        url:'http://localhost:3003/usuarios/'+ req.body.email
                    }  
                }
            }; 
            return res.status(202).send(response);
        };        
    } catch (error) {
        return res.status(500).send({ error:error});                                
    };
};

//deleta usuario
exports.deletaUsuario = async(req,res)=> {
    try {
        const result = await mysql.execute("SELECT * FROM usuarios WHERE email = ?;",[req.body.email]);
        if (result.length == 0) {
            res.status(401).send({
                message: 'Não foi encontrado usuario'
            });
        }else{
            const query = `DELETE FROM usuarios WHERE email = ?;`;
            await mysql.execute(query,[req.body.email]);
            const response ={
                mensagem : 'usuario removida',
                request:{
                    tipo:'GET',
                    descricao: 'retorna usuarios',
                    url:'http://localhost:3003/usuarios/',
                }
                
            }; 
            return res.status(202).send(response);    
        };
    } catch (error) {
        return res.status(500).send({ error:error});                                
    };
};

// login usuario
exports.loginUsuario = async(req,res)=> {
    try {
        const query = `SELECT * FROM usuarios WHERE email = ?`;
        var results = await mysql.execute(query, [req.body.email]);

        if (results.length < 1) {
            return res.status(401).send({ message: 'Falha na autenticação' })
        }
        if (bcrypt.compareSync(req.body.senha, results[0].senha)) {
            const token = jwt.sign({
                email: results[0].email
            },
            "segredo",
            {
                expiresIn: "1h"
            });
            return res.status(200).send({
                message: 'Autenticado com sucesso',
                usuarioEmail:results[0].email,
                token: token
            });
        };
        return res.status(401).send({ message: 'Falha na autenticação' })
    } catch (error) {
        return res.status(500).send({ message: 'Falha na autenticação' });
    };
};