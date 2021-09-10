const express = require('express');
const parser = require('body-parser');
const app = express();
const table = {
  columnsNames: [],
  rows: []
}

function getColumnIndex(columnName){
	const columnNameIndex = table.columnsNames.findIndex(col => col === columnName);
	return columnNameIndex;
}

function getRowIndex(value){
	const rowIndex = table.rows.findIndex(row => row.some(datum => datum === value));
	return rowIndex;
}

function existsInTable(data){
	const existsAsColumn = table.columnsNames.some(col => col === data);
	const existsAsData = table.rows.some(row => row.some(value => value === data));
	return (existsAsColumn || existsAsData) ? true : false;
}

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

//SELECT
app.get('/data', (req, res) => {
	const [col, value] = [req.body.column, req.body.value];
	if(existsInTable(col) && existsInTable(value)){
		const [colIndex, rowIndex] = [getColumnIndex(col), getRowIndex(value)];
		res.send({ found: table.rows[rowIndex][colIndex] });
	}else{
		res.send({ error: "Informação inexistente" });
	}
});

//INSERT
app.post('/data/new', (req, res) => {
	table.rows.push(req.body.values);
	res.send(table.rows);
});

//UPDATE
app.put('/data/change', (req, res) => {
	const [col, id, newValue] = [req.body.column, req.body.id, req.body.newValue];
	if(existsInTable(col) && existsInTable(id)){
		const [colIndex, rowIndex] = [getColumnIndex(col), getRowIndex(id)];
		table.rows[rowIndex][colIndex] = newValue;
		res.send({ updated: table.rows[rowIndex] });
	}else{
		res.send({ error: "Informação inexistente" });
	}
});

//DELETE
app.delete('/data/erase', (req, res) =>{
	const [column, value] = [req.body.column, req.body.value];
  if(existsInTable(column) && existsInTable(value)){
    const rowIndex = getRowIndex(value);
		table.rows = table.rows.filter((row, index) => index !== rowIndex);
		res.send({ updated: table.rows });
    //qualquer funcao que remova um dado de um array
  }else{
    res.send({ error: "Informação inexistente" });
  }
});

//CREATE
app.post('/table/new', (req, res) => {
  table.columnsNames = req.body.columnsNames;
  res.send(table.columnsNames);
});

app.listen(3000, () => {
	console.log("Running at http://localhost:3000");
});
