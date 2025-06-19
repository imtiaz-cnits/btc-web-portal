// import React, { useState } from 'react';
//
// const Notices = () => {
//     // State for modal visibility and form data
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [formData, setFormData] = useState({
//         id: null,
//         title: '',
//         issueDate: '',
//         publishDate: '',
//         status: '',
//         multiSelect: [],
//         file: null,
//         radioOption: 'option1',
//         description: '',
//     });
//     // State for search input
//     const [search, setSearch] = useState(''); // NEW: Controlled search input
//
//     // Sample notices data
//     const [notices, setNotices] = useState([
//         { id: 1, productName: 'Apple MacBook Pro 17"', color: 'Silver', category: 'Laptop', price: '$2999', status: 'Approved', date: '2021-01-24' },
//         { id: 2, productName: 'Microsoft Surface Pro', color: 'White', category: 'Tablet', price: '$1999', status: 'Disable', date: '2022-02-15' },
//         { id: 3, productName: 'Dell XPS 13', color: 'Black', category: 'Laptop', price: '$1500', status: 'Error', date: '2023-03-01' },
//     ]);
//
//     // Handle input changes
//     const handleChange = (e) => {
//         const { name, value, type, files } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: type === 'file' ? files[0] : value,
//         }));
//     };
//
//     // Handle multi-select changes
//     const handleMultiSelect = (e) => {
//         const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
//         setFormData((prev) => ({
//             ...prev,
//             multiSelect: selectedOptions,
//         }));
//     };
//
//     // Open modal for creating a new notice
//     const openModal = () => {
//         console.log('Opening modal'); // DEBUG: Confirm function is called
//         setFormData({
//             id: null,
//             title: '',
//             issueDate: '',
//             publishDate: '',
//             status: '',
//             multiSelect: [],
//             file: null,
//             radioOption: 'option1',
//             description: '',
//         });
//         setIsModalOpen(true);
//     };
//
//     // Open modal for editing an existing notice
//     const openEditModal = (notice) => {
//         console.log('Opening edit modal for notice:', notice); // DEBUG: Confirm function is called
//         setFormData({
//             id: notice.id,
//             title: notice.productName || '',
//             issueDate: notice.date || '',
//             publishDate: notice.date || '',
//             status: notice.status || '',
//             multiSelect: [],
//             file: null,
//             radioOption: 'option1',
//             description: '',
//         });
//         setIsModalOpen(true);
//     };
//
//     // Close modal
//     const closeModal = () => {
//         setIsModalOpen(false);
//     };
//
//     // Handle form submission
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (formData.id) {
//             // Update existing notice
//             setNotices((prev) =>
//                 prev.map((notice) =>
//                     notice.id === formData.id
//                         ? {
//                             ...notice,
//                             productName: formData.title,
//                             category: formData.status,
//                             price: '$0',
//                             status: formData.status,
//                             date: formData.issueDate,
//                         }
//                         : notice
//                 )
//             );
//         } else {
//             // Create new notice
//             setNotices((prev) => [
//                 ...prev,
//                 {
//                     id: prev.length + 1,
//                     productName: formData.title,
//                     category: formData.status,
//                     price: '$0',
//                     status: formData.status,
//                     date: formData.issueDate,
//                 },
//             ]);
//         }
//         closeModal();
//     };
//
//     // Modal Component
//     const EditModal = ({ isOpen, onClose, onSubmit }) => {
//         if (!isOpen) return null;
//
//         // Handle overlay click to close modal only when clicking outside content
//         const handleOverlayClick = (e) => {
//             if (e.target.classList.contains('modal-overlay')) {
//                 onClose();
//             }
//         };
//
//         return (
//             <div
//                 id="editModal"
//                 className="fixed inset-0 z-[1000] flex items-center justify-center p-4" // CHANGED: Increased z-index
//                 onClick={handleOverlayClick} // CHANGED: Added overlay click handler
//             >
//                 <div className="modal-overlay absolute inset-0 bg-[#111111a9] bg-opacity-50"></div>
//
//                 <div className="modal-container relative bg-[var(--bg)] dark:bg-[var(--dark-bg)] border border-transparent dark:border-[var(--dark-border)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
//                     <div className="px-6 py-4 border-b border-[var(--border-color2)] dark:border-[var(--dark-border)] flex justify-between items-center">
//                         <h2 className="text-lg font-semibold !text-[var(--text-1)]">{formData.id ? 'Edit Notice' : 'Add New Notice'}</h2>
//                         <button
//                             onClick={onClose}
//                             className="text-[var(--text-1)] dark:text-[var(--text-4)] hover:text-[var(--text-2)] focus:outline-none transition-colors duration-200 cursor-pointer"
//                             aria-label="Close modal" // NEW: Added for accessibility
//                         >
//                             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                             </svg>
//                         </button>
//                     </div>
//
//                     <div className="overflow-y-auto px-6 py-4">
//                         <form className="modalform" onSubmit={onSubmit}>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
//                                 <div>
//                                     <label htmlFor="title" className="block text-sm font-medium text-[var(--text-1)] mb-1">
//                                         Notice Title
//                                     </label>
//                                     <input
//                                         type="text"
//                                         id="title" // NEW: Added id
//                                         name="title"
//                                         value={formData.title}
//                                         onChange={handleChange}
//                                         className="w-full px-3 py-2 border border-[var(--border-color2)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200"
//                                         placeholder="Notice title"
//                                     />
//                                 </div>
//                             </div>
//
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
//                                 <div>
//                                     <label htmlFor="issueDate" className="block text-sm font-medium text-[var(--text-1)] mb-1">
//                                         Issue Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         id="issueDate" // NEW: Added id
//                                         name="issueDate"
//                                         value={formData.issueDate}
//                                         onChange={handleChange}
//                                         className="w-full px-3 py-2 border border-[var(--border-color2)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="publishDate" className="block text-sm font-medium text-[var(--text-1)] mb-1">
//                                         Publishing Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         id="publishDate" // NEW: Added id
//                                         name="publishDate"
//                                         value={formData.publishDate}
//                                         onChange={handleChange}
//                                         className="w-full px-3 py-2 border border-[var(--border-color2)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200"
//                                     />
//                                 </div>
//                             </div>
//
//                             <div className="mb-3">
//                                 <label htmlFor="status" className="block text-sm font-medium text-[var(--text-1)] mb-1">
//                                     Status
//                                 </label>
//                                 <select
//                                     id="status" // NEW: Added id
//                                     name="status"
//                                     value={formData.status}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-[var(--border-color2)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200"
//                                 >
//                                     <option value="">Select status</option>
//                                     <option value="Approved">Approved</option>
//                                     <option value="Disable">Disable</option>
//                                     <option value="Error">Error</option>
//                                 </select>
//                             </div>
//
//                             <div className="mb-3">
//                                 <label htmlFor="multiSelect" className="block text-sm font-medium text-[var(--text-1)] mb-1">
//                                     Multi-select Filter
//                                 </label>
//                                 <select
//                                     id="multiSelect" // NEW: Added id
//                                     multiple
//                                     name="multiSelect"
//                                     value={formData.multiSelect}
//                                     onChange={handleMultiSelect}
//                                     className="w-full px-3 py-2 border border-[var(--border-color2)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200"
//                                 >
//                                     <option value="AL">Alabama</option>
//                                     <option value="WY">Wyoming</option>
//                                     <option value="NY">New York</option>
//                                     <option value="CA">California</option>
//                                 </select>
//                             </div>
//
//                             <div className="file-upload mb-3">
//                                 <label
//                                     htmlFor="file_input"
//                                     className="block mb-2 text-sm font-medium text-gray-900 dark:text-[var(--text-4)]"
//                                 >
//                                     Upload file
//                                 </label>
//                                 <div className="flex items-center justify-center w-full">
//                                     <label
//                                         htmlFor="file_input"
//                                         className="flex flex-col items-center justify-center w-full h-[80px] border-2 border-[var(--border-color)] border-dashed rounded-lg cursor-pointer bg-[var(--secondary-color)] hover:bg-gray-100 dark:border-[var(--dark-border)] dark:bg-[var(--dark-bg2)] dark:hover:bg-[var(--dark-border)]"
//                                     >
//                                         <div className="flex items-center gap-3">
//                                             <svg
//                                                 className="w-[40px] h-[40px] text-[var(--text-1)] dark:text-[var(--text-4)]"
//                                                 aria-hidden="true"
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 fill="none"
//                                                 viewBox="0 0 20 16"
//                                             >
//                                                 <path
//                                                     stroke="currentColor"
//                                                     strokeLinecap="round"
//                                                     strokeLinejoin="round"
//                                                     strokeWidth="2"
//                                                     d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
//                                                 />
//                                             </svg>
//                                             <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                                                 <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
//                                                     <span className="font-semibold">Click to upload</span> or drag and drop
//                                                 </p>
//                                                 <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
//                                             </div>
//                                         </div>
//                                         <input
//                                             id="file_input"
//                                             type="file"
//                                             name="file"
//                                             onChange={handleChange}
//                                             className="hidden"
//                                         />
//                                     </label>
//                                 </div>
//                             </div>
//
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium text-[var(--text-1)] mb-1">Choose Option</label>
//                                 <div className="flex flex-col sm:flex-row gap-3">
//                                     <label className="inline-flex items-center cursor-pointer">
//                                         <input
//                                             type="radio"
//                                             id="radioOption1" // NEW: Added id
//                                             name="radioOption"
//                                             value="option1"
//                                             checked={formData.radioOption === 'option1'}
//                                             onChange={handleChange}
//                                             className="form-radio text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
//                                         />
//                                         <span className="ml-2 text-[var(--text-1)] dark:text-[var(--text-4)]">Option 1</span>
//                                     </label>
//                                     <label className="inline-flex items-center cursor-pointer">
//                                         <input
//                                             type="radio"
//                                             id="radioOption2" // NEW: Added id
//                                             name="radioOption"
//                                             value="option2"
//                                             checked={formData.radioOption === 'option2'}
//                                             onChange={handleChange}
//                                             className="form-radio text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
//                                         />
//                                         <span className="ml-2 text-[var(--text-1)] dark:text-[var(--text-4)]">Option 2</span>
//                                     </label>
//                                     <label className="inline-flex items-center cursor-pointer">
//                                         <input
//                                             type="radio"
//                                             id="radioOption3" // NEW: Added id
//                                             name="radioOption"
//                                             value="option3"
//                                             checked={formData.radioOption === 'option3'}
//                                             onChange={handleChange}
//                                             className="form-radio text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
//                                         />
//                                         <span className="ml-2 text-[var(--text-1)] dark:text-[var(--text-4)]">Option 3</span>
//                                     </label>
//                                 </div>
//                             </div>
//
//                             <div>
//                                 <label htmlFor="description" className="block text-sm font-medium text-[var(--text-1)] mb-1">
//                                     Description
//                                 </label>
//                                 <textarea
//                                     id="description" // NEW: Added id
//                                     rows="4"
//                                     name="description"
//                                     value={formData.description}
//                                     onChange={handleChange}
//                                     className="w-full px-3 py-2 border border-[var(--border-color2)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200"
//                                     placeholder="Description"
//                                 ></textarea>
//                             </div>
//
//                             <div className="px-6 py-4 border-t border-[var(--border-color2)] dark:border-[var(--dark-border)] flex justify-end space-x-3">
//                                 <button
//                                     type="button"
//                                     onClick={onClose}
//                                     className="px-4 py-2 border border-[var(--border-color2)] dark:border-[var(--dark-border)] rounded-md text-sm font-medium text-[var(--text-1)] dark:text-[var(--text-4)] hover:text-[var(--text-4)] hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200 cursor-pointer"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-[var(--text-4)] bg-[var(--primary-color)] hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition duration-200 cursor-pointer"
//                                 >
//                                     Save Changes
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         );
//     };
//
//     return (
//         <div>
//             <div className="table_main relative bg-[var(--bg)] dark:bg-[var(--dark-bg2)] sm:rounded-lg p-[10px]">
//                 <div className="header_box">
//                     <div className="flex flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 items-start justify-center sm:justify-between mb-[20px] md:mb-0">
//                         <div className="short_box flex gap-2">
//                             <div className="wrapper">
//                                 <form className="max-w-sm">
//                                     <select
//                                         id="day_short"
//                                         className="block w-full p-2 text-sm text-[var(--text-3)] border border-[var(--border-color)] rounded-lg bg-[var(--secondary-color)] focus:border-[var(--primary-color)] focus:outline-hidden dark:bg-[var(--dark-bg2)] dark:border-[var(--border-color)] dark:placeholder-[var(--text-2)] dark:text-[var(--text-4)] dark:focus:border-[var(--primary-color)] cursor-pointer"
//                                     >
//                                         <option defaultValue>Last 30 Day</option>
//                                         <option value="Last Day">Last Day</option>
//                                         <option value="Last 7 Day">Last 7 Day</option>
//                                         <option value="Last 30 Day">Last 30 Day</option>
//                                         <option value="Last Month">Last Month</option>
//                                         <option value="Last Year">Last Year</option>
//                                     </select>
//                                 </form>
//                             </div>
//                             <div className="wrapper">
//                                 <form className="max-w-sm">
//                                     <select
//                                         id="entries_box"
//                                         className="block w-full p-2 text-sm text-[var(--text-3)] border border-[var(--border-color)] rounded-lg bg-[var(--secondary-color)] focus:border-[var(--primary-color)] focus:outline-hidden dark:bg-[var(--dark-bg2)] dark:border-[var(--border-color)] dark:placeholder-[var(--text-2)] dark:text-[var(--text-4)] dark:focus:border-[var(--primary-color)] cursor-pointer"
//                                     >
//                                         <option defaultValue="10">10</option>
//                                         <option value="25">25</option>
//                                         <option value="50">50</option>
//                                         <option value="100">100</option>
//                                     </select>
//                                 </form>
//                             </div>
//                         </div>
//                         <div className="block md:flex items-start gap-2">
//                             <div className="table_src relative mb-[20px]">
//                                 <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
//                                     <svg
//                                         className="w-5 h-5 text-gray-500 dark:text-[var(--text-1)]"
//                                         aria-hidden="true"
//                                         fill="currentColor"
//                                         viewBox="0 0 20 20"
//                                         xmlns="http://www.w3.org/2000/svg"
//                                     >
//                                         <path
//                                             fillRule="evenodd"
//                                             d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
//                                             clipRule="evenodd"
//                                         ></path>
//                                     </svg>
//                                 </div>
//                                 <input
//                                     type="text"
//                                     id="table-search"
//                                     value={search} // NEW: Controlled input
//                                     onChange={(e) => setSearch(e.target.value)} // NEW: Handle search
//                                     className="block ps-10 p-2 text-sm text-[var(--text-3)] border border-[var(--border-color)] rounded-lg bg-[var(--secondary-color)] focus:border-[var(--primary-color)] focus:outline-hidden dark:bg-[var(--dark-bg2)] dark:border-[var(--border-color)] dark:placeholder-[var(--text-2)] dark:text-[var(--text-4)] dark:focus:border-[var(--primary-color)]"
//                                     placeholder="Search for items"
//                                 />
//                             </div>
//
//                             <button
//                                 className="sign_in_btn w-full bg-[var(--primary-color)] text-[var(--text-4)] py-2 px-4 rounded-[12px] hover:bg-[var(--text-1)] transition duration-400 mb-[20px] shadow-md cursor-pointer"
//                                 onClick={openModal}
//                             >
//                                 Create New Notice
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="table_wrapper overflow-x-auto">
//                     <table className="table w-full text-sm text-left rtl:text-right text-[var(--text-1)] dark:text-[var(--text-4)]">
//                         <thead className="text-xs text-[var(--text-1)] dark:text-[var(--text-4)] uppercase bg-[var(--secondary-color)] dark:bg-[var(--dark-bg3)]">
//                         <tr>
//                             <th className="px-3 py-2">Sl</th>
//                             <th className="px-3 py-2 hide_content">Action</th>
//                             <th className="px-3 py-2">Product name</th>
//                             <th className="px-3 py-2">Color</th>
//                             <th className="px-3 py-2">Category</th>
//                             <th className="px-3 py-2">Price</th>
//                             <th className="px-3 py-2 hide_content">Status</th>
//                             <th className="px-3 py-2">Date</th>
//                         </tr>
//                         </thead>
//                         <tbody>
//                         {notices.map((notice, index) => (
//                             <tr key={notice.id} className="dark:border-[var(--dark-border)] border-[var(--border-color2)] border-b">
//                                 <td className="px-3 py-2">
//                                     <div className="flex items-center gap-3">
//                                         <div className="flex items-center checkbox_wrap hide_content">
//                                             <input
//                                                 id={`checkbox-table-search-${notice.id}`}
//                                                 type="checkbox"
//                                                 className="w-4 h-4 text-[var(--primary-color)] bg-[var(--secondary-color)] border-[var(--border-color2)] rounded-sm focus:ring-[var(--primary-color)] dark:focus:ring-[var(--primary-color)] dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-1 dark:bg-[var(--text-1)] dark:border-[var(--dark-border)]"
//                                             />
//                                             <label htmlFor={`checkbox-table-search-${notice.id}`} className="sr-only">
//                                                 checkbox
//                                             </label>
//                                         </div>
//                                         <span>{index + 1}</span>
//                                     </div>
//                                 </td>
//                                 <td className="action-box hide_content px-3 py-2 font-medium text-[var(--text-1)] whitespace-nowrap dark:text-[var(--text-4)]">
//                                     <div className="flex items-center gap-1">
//                                         <button
//                                             className="quick-btn text-[var(--primary-color)] hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 cursor-pointer"
//                                             aria-label="View notice" // NEW: Added for accessibility
//                                         >
//                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                                                 <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </button>
//                                         <button
//                                             className="edit-btn text-yellow-500 hover:text-yellow-700 p-1 rounded-full hover:bg-yellow-50 cursor-pointer"
//                                             onClick={() => openEditModal(notice)}
//                                             aria-label="Edit notice" // NEW: Added for accessibility
//                                         >
//                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                                                 <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                                             </svg>
//                                         </button>
//                                         <button
//                                             className="delete-btn text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 cursor-pointer"
//                                             aria-label="Delete notice" // NEW: Added for accessibility
//                                         >
//                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             </svg>
//                                         </button>
//                                     </div>
//                                 </td>
//                                 <td scope="row" className="px-3 py-2 font-medium text-[var(--text-1)] whitespace-nowrap dark:text-[var(--text-4)]">
//                                     {notice.productName}
//                                 </td>
//                                 <td className="px-3 py-2">{notice.color}</td>
//                                 <td className="px-3 py-2">{notice.category}</td>
//                                 <td className="px-3 py-2">{notice.price}</td>
//                                 <td className="px-3 py-2 hide_content">
//                                     <button className={`${notice.status.toLowerCase()}-status flex items-center`}>
//                                         <svg
//                                             xmlns="http://www.w3.org/2000/svg"
//                                             className={`h-4 w-4 ${notice.status === 'Approved' ? 'text-green-500' : notice.status === 'Error' ? 'text-red-500' : 'text-gray-500'} mr-1`}
//                                             viewBox="0 0 20 20"
//                                             fill="currentColor"
//                                         >
//                                             {notice.status === 'Approved' && (
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             )}
//                                             {notice.status === 'Disable' && (
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             )}
//                                             {notice.status === 'Error' && (
//                                                 <path
//                                                     fillRule="evenodd"
//                                                     d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
//                                                     clipRule="evenodd"
//                                                 />
//                                             )}
//                                         </svg>
//                                         <span
//                                             className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                                 notice.status === 'Approved'
//                                                     ? 'bg-green-100 text-green-800'
//                                                     : notice.status === 'Error'
//                                                         ? 'bg-red-100 text-red-800'
//                                                         : 'bg-gray-100 text-gray-800'
//                                             }`}
//                                         >
//                         {notice.status}
//                       </span>
//                                     </button>
//                                 </td>
//                                 <td className="px-3 py-2">{notice.date}</td>
//                             </tr>
//                         ))}
//                         </tbody>
//                     </table>
//                     <p className="entries pt-2">Showing {notices.length} of {notices.length} entries</p>
//
//                     <div className="pagination">
//                         <ul className="flex justify-center">
//                             <li>
//                                 <a className="previous" href="#">
//                                     <span>previous</span>
//                                 </a>
//                             </li>
//                             <li>
//                                 <a className="item" href="#">
//                                     1
//                                 </a>
//                             </li>
//                             <li>
//                                 <a className="item" href="#">
//                                     2
//                                 </a>
//                             </li>
//                             <li>
//                                 <a className="item" href="#">
//                                     3
//                                 </a>
//                             </li>
//                             <li>
//                                 <a className="next" href="#">
//                                     <span>Next</span>
//                                 </a>
//                             </li>
//                         </ul>
//                     </div>
//                 </div>
//             </div>
//
//             <EditModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit} />
//         </div>
//     );
// };
//
// export default Notices;