import { Fragment, useCallback, useEffect, useState, useRef } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"
import { Transaction } from "./utils/types"
import useCacheCheckList from './hooks/useCacheCheckList';

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions,  ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[] | []>([]);
  const {unCheckList, checkedList} = useCacheCheckList();
  const ref = useRef<string>('');
  const page = useRef<number>(0);

  const setResult = (arr: Transaction[] | [])=> {
    arr.forEach(r=>{
      if(unCheckList.has(r.id)){
        r.approved = false;
      }else if(checkedList.has(r.id)){
        r.approved = true;
      }   
    }) 
    return arr;
  }

  useEffect(()=> {
    if(paginatedTransactions?.data) {
      page.current = paginatedTransactions.nextPage || -1;
      setTransactions(setResult([...transactions, ...paginatedTransactions.data]));
    }else if(transactionsByEmployee){
      page.current = -1;
      setTransactions(setResult([...transactions, ...transactionsByEmployee]));
    }else{
      page.current = -1;
      setTransactions([]);
    }
  }, [paginatedTransactions, transactionsByEmployee]);

  useEffect(()=> {
    setIsLoading(true)
    const req = async() => {
      await employeeUtils.fetchAll();
      setIsLoading(false)
    }
    req();
  }, []);
  
  const loadAllTransactions = useCallback(async () => {
    transactionsByEmployeeUtils.invalidateData()
    await paginatedTransactionsUtils.fetchAll()
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            if(ref.current !== newValue.id) {
              page.current = 0;
              setTransactions([]);
            }
            ref.current = newValue.id;
            if(newValue.id) {
              await loadTransactionsByEmployee(newValue.id)
            }else{
              await loadAllTransactions();
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {(transactions?.length > 0 && page.current >= 0) && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                  await loadAllTransactions();
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
