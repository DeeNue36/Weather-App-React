export const ApiError = () => {
    return (
        <div className="api-error-container">
            <img src="/icon-error.svg" alt="error icon" />
            <h1>Something Went Wrong</h1>
            <p>We couldn't connect to the server (API Error). Please try again in a few moments</p>
            <button>
                <img src="/icon-retry.svg" alt="retry icon" />
                Retry
            </button>
        </div>
    )
}