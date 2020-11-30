var text = document.getElementById('txt');
var add = document.getElementById('add');
var del = document.getElementById('delete');
var edit = document.getElementById('edit');
var previous = document.getElementById('previous');
var next = document.getElementById('next');
var first = document.getElementById('first');
var last = document.getElementById('last');
var pointer;

// INICIO CLASE DE LA BASE DE DATOS RELACIONADA A LA COLA

class Queue {
    constructor() {
        this.queue = [];
        this.pointer = 0;
    }

    add(data) {
        this.queue.push(data);
    }

    delete(pos) {
        this.queue.splice(pos, 1);
    }

    edit(pos, data) {
        this.queue[pos] = data;
    }

    getNext(cursor) {
        return this.queue[cursor];
    }

    getPrevious(cursor) {
        return this.queue[cursor];
    }

    getFirst() {
        return this.queue[0];
    }

    getLast() {
        return this.queue[this.queue.length - 1];
    }

    size() {
        return this.queue.length;
    }

    isEmpty() {
        let isEmpty = (this.size() == 0) ? true : false;
        return isEmpty;
    }

    print() {
        console.log(this.queue);
    }

    getQueue() {
        return this.queue;
    }

    getKey(cursor){
        return this.queue[cursor].id;
    }

    delAll() {
        for (let i = 0; i < this.queue.length; i++) {
            this.delete(i);
        }
    }
}

// FIN CLASE DE LA BASE DE DATOS RELACIONADA A LA COLA

// ---------------------------------------------------------------------------------------

// INICIO CLASE DE LA BASE DE DATOS RELACIONADA A INDEXEDDB

class DataBase {
    constructor() {
        this.indexedDB = window.indexedDB;
        this.database;
        this.queue = new Queue();
        this.cursor = 0;
        this.id = 0;
    }

    start() {
        // var indexedDB = window.indexedDB
        if (this.indexedDB) {
            var request = this.indexedDB.open('data', 1);

            request.onsuccess = () => {
                this.database = request.result;
                console.log("OPEN -> ", this.database);
                this.read();
            }

            request.onupgradeneeded = () => {
                console.log(this.cursor);
                this.database = request.result;
                console.log("CREATE -> ", this.database);
                var store = this.database.createObjectStore('tarea', {
                    keyPath: 'id'
                });
            }

            request.onerror = (error) => {
                alert("Error ", error);
                return false;
            }
        }
    }

    add(data) {
        this.incrementID();

        if (this.indexedDB) {
            let transaction = this.database.transaction(['tarea'], 'readwrite');
            let store = transaction.objectStore('tarea');
            let request = store.add({
                id: this.id,
                texto: data
            });
            
            this.queue.delAll();

            this.read();
        }

        
        window.location.reload();
    }


    read() {
        let transaction;
        let store;
        let request;
        let retorno;
        if (this.indexedDB) {
            transaction = this.database.transaction(['tarea'], 'readonly');
            store = transaction.objectStore('tarea');
            request = store.openCursor();
            console.log(request);
            request.onsuccess = (e) => {
                this.cursor = e.target.result;
                if (this.cursor) {
                    this.queue.add(this.cursor.value)
                    this.cursor.continue();
                } else {
                    // this.cursor = this.queue.getFirst().id;
                    try {
                        text.value = this.queue.getFirst().texto;
                        this.id = this.queue.getLast().id;       
                    } catch (error) {
                        console.log("IndexedDB vacío");
                    }
                }
            }
        }

    }

    edit(data) {
        console.log(this.queue.getKey(this.cursor) + " -> key a editar");
        let key = this.queue.getKey(this.cursor);
        if (this.indexedDB) {
            let transaction = this.database.transaction(['tarea'], 'readwrite');
            let store = transaction.objectStore('tarea');
            let request = store.put({
                id: key,
                texto: data
            });
            
            this.queue.delAll();

            this.read();
        }

        // window.location.reload();
    }

    del() {
        console.log(this.queue.getKey(this.cursor) + " -> key a borrar");
        let key = this.queue.getKey(this.cursor);
        if (this.indexedDB) {
            let transaction = this.database.transaction(['tarea'], 'readwrite');
            let store = transaction.objectStore('tarea');
            // let request = store.delete(this.cursor);
            let request = store.delete(key); // + 1

            request.onsuccess = () => {
                this.queue.delAll();
                this.read();
            }
            
        }

        // window.location.reload();
    }

    next() {
        if (!this.queue.isEmpty() && (this.cursor < (this.queue.size() - 1))) {
            console.log(this.cursor);
            this.cursor += 1;
            text.value = this.queue.getNext(this.cursor).texto;
            // this.cursor = this.queue.getKey(this.cursor);
            // console.log(this.queue.getKey(this.cursor));
        } else {
            alert("Ha llegado al último elemento");
            return false;
        }
    }

    previous() {
        if (!this.queue.isEmpty() && this.cursor >= 1) {
            console.log(this.cursor);
            this.cursor -= 1;
            text.value = this.queue.getPrevious(this.cursor).texto;
            // this.cursor = this.queue.getKey(this.cursor);
        } else {
            alert("Se encuentra ubicado en el primer elemento");
            return false;
        }
    }

    first() {
        this.cursor = 0;
        text.value = this.queue.getFirst().texto;
    }

    last() {
        this.cursor = this.queue.size() - 1;
        text.value = this.queue.getLast().texto;
    }


    incrementID() {
        this.id += 1;
    }
}

// FIN CLASE DE LA BASE DE DATOS RELACIONADA A INDEXEDDB

var bd = new DataBase();
window.addEventListener("load", bd.start(), false);

function execute() {
    if (add.checked) {
        if (text.value != '') {
            bd.add(text.value);
        } else {
            alert("¡Ingrese un texto para agregar a la base de datos!");
            return false;
        }
    } else if (del.checked) {
        bd.del();
    } else if (edit.checked) {
        if(text.value != ''){
            bd.edit(text.value);
        }else{
            alert("¡Ingrese un texto para editarlo en la base de datos!");
            return false;
        }
    } else if (next.checked) {
        bd.next();
    } else if (previous.checked) {
        bd.previous();
    } else if (first.checked) {
        bd.first();
    } else if (last.checked) {
        bd.last();
    } else {
        alert("Seleccione una opción");
        return false;
    }
}

function clean(){
    text.value = '';
}