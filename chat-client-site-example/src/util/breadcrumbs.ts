const siteStructure = [
    {
        title: 'Главная', href: '', children: [{
            title: 'Кабинет', href: 'panel', children: [
                { title: 'Финансы', href: 'finance' },
                { title: 'Сообщения', href: 'message' },
                { title: 'Покупки', href: 'purchases' }
            ]
        }]
    }
]

const findNestedObjs = (arr: typeof siteStructure, route) => {
    const results = []
    console.log(route)
    const parts = route.split('/').filter(x => x.length > 0)
    console.log(parts)
    const findNested = (obj, previousObj, level) => {
        if (level > parts.length - 1) return
        if (parts[level] == obj.href) {
            if(previousObj) obj.href = previousObj.href + '/' + obj.href
            results.push(obj)
            console.log('pushed at lvl ' + level, obj)
        }

        if (obj.children) obj.children.forEach(x => findNested(x, obj, level + 1))
    }

    arr.forEach(route => findNested(route, null, 0))

    results.unshift(arr[0])

    console.log(results)
    return results
}

export const getBreadcrumbs = (route: string) => {
    const result = findNestedObjs(siteStructure, route.split('?')[0].split('#')[0])
    return result
}