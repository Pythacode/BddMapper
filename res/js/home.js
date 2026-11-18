const zone = document.getElementById('zone')
let actif = false;

let offsetX;
let offsetY;

let tables = new Set();

let in_link = false

let mousePos = {x: 0, y: 0}

function removePrefix(str, prefix) {
  return str.startsWith(prefix) ? str.slice(prefix.length) : str;
}

document.addEventListener('mousemove', e => {
    mousePos = e
    zone.querySelectorAll(`svg[data-start="mouse"], svg[data-end="mouse"]`).forEach(link => {
        update(link);
    })
})

function set_move(elem) {
    elem.addEventListener('pointerdown', e => {
        if (e.target.closest('.button')) return;

        e.preventDefault();
        actif = true;
        elem.setPointerCapture(e.pointerId);
        
        offsetX = e.pageX - elem.offsetLeft;
        offsetY = e.pageY - elem.offsetTop;
    });

    elem.addEventListener('pointermove', e => {
        if (!actif) return;
        zone.querySelectorAll(`svg[data-start^="column-${removePrefix(elem.id, "table-")}"], svg[data-end^="column-${removePrefix(elem.id, "table-")}"]`).forEach(link => {
            update(link);
        })

        const rect = zone.getBoundingClientRect();
        let x = e.clientX - rect.left - offsetX;
        let y = e.clientY - rect.top - offsetY;
        x = Math.max(0, Math.min(x, zone.clientWidth  - elem.offsetWidth));
        y = Math.max(0, Math.min(y, zone.clientHeight - elem.offsetHeight));
        elem.style.left = x + 'px';
        elem.style.top  = y + 'px';
    });

    elem.addEventListener('pointerup', () => {
        actif = false
        zone.querySelectorAll(`svg[data-start^="column-${removePrefix(elem.id, "table-")}"], svg[data-end^="column-${removePrefix(elem.id, "table-")}"]`).forEach(link => {
            update(link);
        })
    });

}

function addTable(name, pos) {
    if (tables.has(name)) {
        alert('Cette table exsiste déja :(')
        return
    }
    tables.add(name)

    const table = document.createElement('div')
    table.className = 'table'
    table.id = `table-${name}`
    set_move(table)
    if (pos) {
        table.style.left = pos.x
        table.style.top = pos.y
    }
    
    const title = document.createElement('h1')
    title.innerText = name
    title.className = "tableName"
    table.appendChild(title)

    const addColumnButton = document.createElement('div')
    addColumnButton.innerText = '+'
    addColumnButton.className = "addColumnButton button"
    addColumnButton.addEventListener('click', (e) => {e.stopPropagation();addColumn(name)});
    table.appendChild(addColumnButton)

    zone.appendChild(table)
}

document.getElementById('newTableButton').addEventListener('click', e => {
    const name = prompt('Entrez le nom de la nouvelle table')
    if (name) {
        addTable(name)
    }
})

function addColumn(tableName, name=null) {
    if (name===null) {name = prompt(`Entrez le nom de la colomne pour ${tableName} :`)};
    if (name) {
        if (document.getElementById(`column-${tableName}-${name}`)) {
            alert('Cet colomne exsiste déjà :/')
            return
        }

        const table = document.getElementById(`table-${tableName}`)

        const before = document.createElement('div')
        before.className = 'dot before button'
        before.id = `column-${tableName}-${name}-before`

        const column = document.createElement('div')
        column.className = "column"
        column.innerText = name
        column.id = `column-${tableName}-${name}`

        const after = document.createElement('div')
        after.className = 'dot after button'
        after.id = `column-${tableName}-${name}-after`

        set_linkable(before)
        set_linkable(after)
        
        column.appendChild(before)
        table.appendChild(column)
        column.appendChild(after)
    }
    
}

function drawCurve(link, x1, y1, x2, y2) {
    const dx = (x2 - x1) * 0.5;
    const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    link.querySelector('path').setAttribute('d', d);
}

function centre(el) {
  const r = el.getBoundingClientRect();
  const z = zone.getBoundingClientRect();
  
  return {
    x: r.left - z.left + r.width  / 2,
    y: r.top  - z.top  + r.height / 2
  };
}

function update(link) {
    const a = centre(document.getElementById(link.dataset.start));
    let b;
    if (link.dataset.end == "mouse") {
        b = mousePos
    } else {
        b = centre(document.getElementById(link.dataset.end));
    }
    drawCurve(link, a.x, a.y, b.x, b.y);
}

function set_linkable(dot) {
    dot.addEventListener('mousedown', e => {
        if (in_link) {return}
        in_link = true
        addLink(dot.id, 'mouse')
    })
}

document.addEventListener('mouseup', e => {
    if (!in_link) {return}
    in_link = false

    const actualPath = zone.querySelector(`svg[data-end="mouse"]`)

    if (e.target.closest('.dot')) {
        if (actualPath.dataset.start == e.target.id) {
            zone.querySelectorAll(`svg[data-start="${e.target.id}"], svg[data-end="${e.target.id}"]`).forEach(l => removeLink(l))
        } else if (
            !(actualPath.dataset.start.startsWith(e.target.id.split('-').slice(0, 2).join('-')))
        ) {
            actualPath.dataset.end = e.target.id
            e.target.classList.add('actif')
            update(actualPath)
        } else {
            removeLink(actualPath)
        }
    } else {
        removeLink(actualPath)
    }
})

function addLink(start, end) {
    const SVG_NS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('class', 'link');
    svg.dataset.start = start
    svg.dataset.end = end

    document.getElementById(start).classList.add('actif');
    if (!(end=="mouse")) document.getElementById(end).classList.add('actif');

    const path = document.createElementNS(SVG_NS, 'path');

    svg.addEventListener('click', () => {
        removeLink(svg)
    })

    path.id = 'courbe';
    path.setAttribute('stroke-width', '2');

    svg.appendChild(path);
    
    zone.appendChild(svg)

    update(svg);
}

function removeLink(link) {
    if (zone.querySelectorAll(`svg[data-start="${link.dataset.start}"], svg[data-end="${link.dataset.start}"]`).length <= 1) {
        document.getElementById(link.dataset.start).classList.remove('actif')
    }

    if (!(link.dataset.end == 'mouse')) {
        if (zone.querySelectorAll(`svg[data-start="${link.dataset.end}"], svg[data-end="${link.dataset.end}"]`).length <= 1) {
            document.getElementById(link.dataset.end).classList.remove('actif')
        }
    }
    
    zone.removeChild(link)
}

function save() {
    let tables = []
    console.log('Save')
    zone.querySelectorAll('.table').forEach(table => {
        t = {
            name: removePrefix(table.id, 'table-'),
            x: table.style.left,
            y: table.style.top,
            column: []
        };
        table.querySelectorAll('.column').forEach(column => {
            t.column.push(column.innerText.trim());   // push, pas append
        });
        tables.push(t)
    })
    let links = []
    zone.querySelectorAll('.link').forEach(link => {
        if (link.dataset.end == "mouse") {return}
        links.push({
            start: link.dataset.start,
            end: link.dataset.end
        })
    })
    
    localStorage.setItem('session', JSON.stringify({
        tables: tables,
        links: links
    }));
}

function erase_save() {
    localStorage.setItem('session', JSON.stringify({
        tables: [],
        links: []
    }));
}

const sauv = JSON.parse(localStorage.getItem('session') || 'null')

if (sauv) {
    sauv.tables.forEach(table => {
        addTable(table.name, {x:table.x, y:table.y})

        table.column.forEach(col => addColumn(table.name, col));
    });

    sauv.links.forEach(link => {
        addLink(link.start, link.end)
    })
}