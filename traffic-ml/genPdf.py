from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        # Font: Arial bold 15
        self.set_font('Arial', 'B', 15)
        # Title
        self.cell(0, 10, 'Traffic Prediction Model Documentation', 0, 1, 'C')
        # Line break
        self.ln(10)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('Arial', 'I', 8)
        # Page number
        self.cell(0, 10, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')

    def chapter_title(self, label):
        # Arial 12
        self.set_font('Arial', 'B', 12)
        # Background color
        self.set_fill_color(200, 220, 255)
        # Title
        self.cell(0, 6, f"{label}", 0, 1, 'L', 1)
        # Line break
        self.ln(4)

    def chapter_body(self, body):
        # Read text file
        self.set_font('Arial', '', 11)
        # Output justified text
        self.multi_cell(0, 5, body)
        # Line break
        self.ln()

# Create PDF object
pdf = PDF()
pdf.alias_nb_pages()
pdf.add_page()
pdf.set_auto_page_break(auto=True, margin=15)

# ==========================================
# CONTENT DEFINITION
# ==========================================

# Section 1
pdf.chapter_title("1. Model Architecture")
text_1 = (
    "Algorithm: Random Forest Regressor\n"
    "Library: Scikit-Learn (sklearn.ensemble)\n"
    "Type: Supervised Learning (Regression)\n\n"
    "Why this model was chosen:\n"
    "- Handling Non-Linearity: Traffic patterns are complex and not strictly linear. "
    "A 10km trip doesn't always take 2x longer than a 5km trip (e.g., highway vs. city center).\n"
    "- Robustness: Being an ensemble method, it averages the results of multiple 'Decision Trees' "
    "(50 trees in this implementation) to reduce errors and prevent overfitting."
)
pdf.chapter_body(text_1)

# Section 2
pdf.chapter_title("2. Input Parameters (Features)")
text_2 = (
    "The model requires exactly 6 inputs to generate a prediction:\n\n"
    "1. src_lat (Float): Latitude of the starting point.\n"
    "2. src_lon (Float): Longitude of the starting point.\n"
    "3. dest_lat (Float): Latitude of the destination.\n"
    "4. dest_lon (Float): Longitude of the destination.\n"
    "5. distance_km (Float): The Haversine distance between source and destination. "
    "(Calculated automatically by the backend, not provided by the user).\n"
    "6. hod (Integer): Hour of Day (0-23). This allows the model to distinguish "
    "between Peak Hours (e.g., 9 AM) and Off-Peak Hours (e.g., 3 AM)."
)
pdf.chapter_body(text_2)

# Section 3
pdf.chapter_title("3. Output (Target Variable)")
text_3 = (
    "Variable: mean_travel_time\n"
    "Unit: Seconds\n"
    "Post-Processing: The raw output is divided by 60 in the application layer "
    "to display the estimate in 'Minutes' for the user."
)
pdf.chapter_body(text_3)

# Section 4
pdf.chapter_title("4. The Training Pipeline")
text_4 = (
    "1. Data Ingestion: Loaded ~800,000 trip records (CSV) and Ward Spatial Data (GeoJSON).\n\n"
    "2. Spatial Mapping: Mapped abstract 'Zone IDs' to physical Centroid Coordinates (Lat/Lon).\n\n"
    "3. Feature Engineering: Calculated 'Haversine Distance' for all rows using Vectorized NumPy operations. "
    "This taught the model the physical distance of every trip.\n\n"
    "4. Splitting: Dataset split into 80% Training (Learning) and 20% Testing (Validation).\n\n"
    "5. Hyperparameters: configured with 'n_estimators=50' (voting power) and 'max_depth=15' "
    "(to prevent overfitting and reduce model file size)."
)
pdf.chapter_body(text_4)

# Section 5
pdf.chapter_title("5. Common Viva / Interview Questions")
text_5 = (
    "Q1: Why Random Forest instead of a Neural Network (LSTM)?\n"
    "A: Random Forest is excellent for tabular data and provides high accuracy without "
    "requiring the massive computational power or complex architecture of deep learning models. "
    "Given the dataset size, it offers the best balance of speed and accuracy.\n\n"
    "Q2: How does the model handle traffic jams?\n"
    "A: It handles recurrent traffic jams based on historical patterns. If a road is always congested "
    "at 6 PM, the model learns this correlation via the 'Hour of Day' feature. It cannot predict "
    "live accidents, only typical patterns.\n\n"
    "Q3: What is 'Haversine' distance?\n"
    "A: It is the formula to calculate the shortest distance between two points on a sphere. "
    "We use it instead of Euclidean distance because the Earth is curved, making it more accurate for GPS data.\n\n"
    "Q4: Can this work for other cities?\n"
    "A: The architecture is universal, but the model instance is specific to Bangalore. "
    "To support another city, we would simply retrain the model using that city's dataset."
)
pdf.chapter_body(text_5)

# Save
output_filename = "Traffic_Model_Documentation.pdf"
pdf.output(output_filename)
print(f"✅ PDF generated successfully: {output_filename}")