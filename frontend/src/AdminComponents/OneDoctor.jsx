const OneDoctor = ({ id, name, email, state, role, onEdit, onDelete }) => {
  return (
    <div className="text-[13px] w-full">
      <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center justify-between p-2">
        <span className="capitalize w-1/2 sm:w-[150px]">Dr. {name}</span>
        <span className="w-1/2 sm:w-[200px] truncate">{email}</span>
        <span className="w-1/2 sm:w-[120px]">{state==1?'Active':'Inactive'}</span>
        <span className="w-1/2 sm:w-[120px]">{role}</span>

        <div className="flex justify-end gap-2 w-full sm:w-auto">
          <button
            className="border border-[#929A9B] text-[13px] px-2 py-1 hover:bg-[#679294] hover:text-white cursor-pointer rounded"
            onClick={() => onEdit(email , name)}
          >
            Edit
          </button>
          <button
            className="border border-[#929A9B] text-[13px] px-2 py-1 hover:bg-[#679294] hover:text-white cursor-pointer rounded"
            onClick={() => onDelete(email)}  
          >
            Delete
          </button>
        </div>
      </div>
      <div className="h-[1px] bg-[#BBBBBF] w-full" />
    </div>
  );
};

export default OneDoctor;
