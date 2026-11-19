let structure = {tables:[], links:[]}

function getNewTableId() {
    let id = -1
    structure.tables.forEach(element => {
        id = element.id
    });
    return id + 1
}