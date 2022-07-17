

function test (s){

  function isA(chat){
    if(chat === 'a') {
      return isB
    }

    return isA
  }
  function isB(chat){
    if(chat === 'b') {
      return isC
    }

    return isA
  }
  function isC(chat){
    if(chat === 'c') {
      return end
    }

    return isA
  }
  function end(){
    return end
  }
  let newState = isA

  for(let i = 0 ; i <s.length;i++){
   let nextState = newState(s[i])
   newState = nextState

    if(newState === end) {
      return true
    }
  }
  return false
  
}

console.log(test('abc11'))