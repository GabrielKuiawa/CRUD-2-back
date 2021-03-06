const mysql = require("../msql");


//retorna vagas 
exports.getVagas = async(req,res,next)=> {
    try {
        const result = await mysql.execute("SELECT * FROM vagas_emprego;")
        if (result.length == 0) {
            return res.status(200).send({
                message: 'Não foi encontrado vagas'
            });
        };
        const response = {
            id: result.lenght,
            vagas: result.map(vagas => {
                return{
                    id_vag: vagas.id_vag,
                    titulo: vagas.titulo,
                    salario:vagas.salario,
                    descricao:vagas.descricao,
                    empresa_id:vagas.empresa_id,
                    request:{
                        tipo: 'GET',
                        descricao:'retorna id da vaga',
                        url:'http://localhost:3003/vagas/'+ vagas.id
                    }                     
                }
            })
        }
        return res.status(200).send(response);        
    } catch (error) {
        return res.status(500).send({ error:error});        
    }
};

//retorna vagas com id
exports.getVagasId = async(req,res,next)=> {
    try {
        const query = 'SELECT * FROM vagas_emprego WHERE id_vag = ?;';
        const result = await mysql.execute(query,[req.params.id]);
        
        if (result.length == 0) {
            return res.status(404).send({
                message: 'Não foi encontrado vagas com este ID'
            });
        };
        const response = {
            vagasId:{
                id: result[0].id_vag,
                titulo:result[0].titulo,
                salario:result[0].salario,
                descricao:result[0].descricao,
                empresa:result[0].empresa_id,
                request:{
                    tipo: 'GET',
                    descricao:'retorna um todas vagas',
                    url:'http://localhost:3003/vagas'
                }   
            }

        };
        return res.status(201).send(response);    
    } catch (error) {
        return res.status(500).send({ error:error});          
    };     
};
//vagas por empresa
exports.getVagasEmpresasID = async(req,res,next)=> {
    try {
       
        const query = `SELECT emp.id,
                              emp.nome,
                              vag.id_vag,
                              vag.titulo
                         FROM empresas as emp
                   INNER JOIN vagas_emprego as vag
                           ON emp.id = vag.empresa_id   
                        WHERE emp.id = ?`;

        const result = await mysql.execute(query,[req.params.id]);
        
        if (result.length == 0) {
            return res.status(404).send({
                message: 'Não foi encontrada vaga com este ID'
            })
        };
        const response = {
            EmpresaId: {
                tudo:result,
                imagem:'http://localhost:3003/'+result[0].imagem,
                request:{
                    tipo: 'GET',
                    descricao:'retorna um todas empresas',
                    url:'http://localhost:3003/empresas'
                }  
            }
        };
        return res.status(201).send(response);    
    } catch (error) {
        return res.status(500).send({ error:error});                
    };
};

//insere uma vaga 
exports.insereVaga = async(req,res,next)=> {
    try {
        const result = await mysql.execute("SELECT * FROM empresas WHERE id = ?;",[req.body.empresa_id]);
        console.log(result);
        if (result.length == 0) {
            res.status(404).send({
                message: 'empresa não encontrada'
            });
        }else{
            const query = 'INSERT INTO vagas_emprego (empresa_id,titulo,salario,descricao) VALUES (?,?,?,?);';
            const result = await mysql.execute(query,
                [
                req.body.empresa_id,
                req.body.titulo,
                req.body.salario,
                req.body.descricao
                ]);   
                const response = {
                    mensagem: 'vaga inserida com secesso',
                    empresaCriada: {
                        id: result.insertId,
                        titulo: req.body.titulo,
                        salario:req.body.salario,
                        descricao:req.body.descricao,
                        idEmpresas:req.body.empresa_id,
                        request:{
                            tipo: 'GET',
                            descricao:'retorna vaga com id',
                            url:'http://localhost:3003/vagas/' + result.insertId 
                        }  
                }
            }       
            return res.status(201).send(response);
        }
    } catch (error) {
        return res.status(500).send({ error:error});                
    };
};

//altera uma vaga
exports.alteraVaga = async(req,res,next)=> {
    try {
        const result = await mysql.execute("SELECT * FROM vagas_emprego WHERE id_vag = ?;",[req.body.id]);
        if (result.length == 0) {
            res.status(404).send({
                message: 'Não foi encontrado vaga'
            });
        }else{
            const query = 
                `UPDATE vagas_emprego
                    SET titulo = ?, 
                        salario = ?, 
                        descricao = ?
                WHERE id_vag = ?;`;
            await mysql.execute(query,
            [
            req.body.titulo,
            req.body.salario,
            req.body.descricao,
            req.body.id,
            ]);
            const response = {
                mensagem: 'vaga atualizado com secesso',
                Atualizada: {
                    id:req.body.id,
                    titulo:req.body.titulo,
                    salario:req.body.salario,
                    descricao:req.body.descricao,
                    empresa_id:req.body.empresa_id,
                    request:{
                        tipo: 'GET',
                        description:'retorna vaga com id',
                        url:'http://localhost:3003/vagas/'+ req.body.id
                    }  
                }
            }; 
            return res.status(202).send(response);
        };  
    } catch (error) {
        return res.status(500).send({ error:error});                        
    };
};

//deleta vaga
exports.deletaVaga = async(req,res,next)=> {
    try {
        const result = await mysql.execute("SELECT * FROM vagas_emprego WHERE id_vag = ?;",[req.params.id]);
        if (result.length == 0) {
            res.status(404).send({
                message: 'Não foi encontrado vaga'
            });
        }else{
            const query = `DELETE FROM vagas_emprego WHERE id_vag = ?;`;
            await mysql.execute(query,[req.params.id]);
            const response ={
                mensagem : 'vaga removida',
                request:{
                    tipo:'GET',
                    descricao: 'retorna vaga',
                    url:'http://localhost:3003/vaga',
                }
                
            }    
            return res.status(202).send(response);    
        }       
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error:error});                        
    };
};
