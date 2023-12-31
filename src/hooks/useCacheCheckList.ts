import { createContext,useContext } from "react";
const cacheList = createContext({unCheck: new Set(), checked: new Set()});

const useCacheCheckList = ()=> {
    const {unCheck, checked} = useContext(cacheList)
    const addCheck = (id: string)=> {
        checked.add(id);
        if(unCheck.has(id)) {
            unCheck.delete(id);
        }
    }
    const deleteCheck = (id: string)=> {
        if(checked.has(id)) {
            checked.delete(id);
        }
        unCheck.add(id)
    }
    return {unCheckList: unCheck, checkedList: checked, addCheck, deleteCheck};
}
export default useCacheCheckList;