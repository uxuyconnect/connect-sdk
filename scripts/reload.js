
if(typeof EventSource != "undefined"){
    new EventSource('/esbuild').addEventListener('change', (...arg) => {
        console.log("change....", arg)
        location.reload()
    })
}else{
    console.warn("reload not support EventSource")
}
