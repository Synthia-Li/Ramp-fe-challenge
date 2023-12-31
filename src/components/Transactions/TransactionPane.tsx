import { useState } from "react"
import { InputCheckbox } from "../InputCheckbox"
import { TransactionPaneComponent } from "./types"
import useCacheCheckList from '../../hooks/useCacheCheckList';

export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  setTransactionApproval: consumerSetTransactionApproval,
}) => {
  const [approved, setApproved] = useState(transaction.approved)
  const {addCheck, deleteCheck} = useCacheCheckList();
  return (
    <div className="RampPane" id={transaction.id}>
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant} </p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox
        id={transaction.id}
        checked={approved}
        disabled={loading}
        onChange={async (newValue) => {
          if(newValue) {
            addCheck(transaction.id);
          }else{
            deleteCheck(transaction.id);
          }
          setApproved(newValue)
          await consumerSetTransactionApproval({
            transactionId: transaction.id,
            newValue,
          })
        }}
      />
    </div>
  )
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})
